import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.evidence import Evidence
from app.models.skill import Skill

def generate_reason_codes(
    mastery_score: float,
    confidence_score: float,
    evidence_list: List[Evidence],
    has_prerequisite_deficit: bool = False
) -> List[str]:
    codes = []
    
    if confidence_score < 0.40:
        codes.append("EARLY_SIGNAL_NEEDS_VERIFICATION")
    
    # Check recent evidence
    if evidence_list:
        sorted_ev = sorted(evidence_list, key=lambda x: x.timestamp, reverse=True)
        recent_scores = [e.normalized_score for e in sorted_ev[:3]]
        if recent_scores and (sum(recent_scores) / len(recent_scores)) < 0.50:
            codes.append("LOW_RECENT_PERFORMANCE")

    # Check source diversity
    sources = set(e.source_type for e in evidence_list)
    if len(sources) >= 2 and mastery_score < 0.60:
        codes.append("MULTIPLE_SOURCES_AGREE")

    if any(e.source_type == "SELF_REPORT" and e.normalized_score < 0.50 for e in evidence_list):
        codes.append("SELF_REPORTED_STRUGGLE")

    if has_prerequisite_deficit:
        codes.append("FOUNDATIONAL_PREREQUISITE_DEFICIT")

    if not codes:
        codes.append("PERSISTENT_MASTERY_DEFICIT")

    return codes

def build_structured_explanation(
    skill: Skill,
    mastery_score: float,
    confidence_score: float,
    severity_score: float,
    priority_score: float,
    evidence_list: List[Evidence],
    reason_codes: List[str]
) -> Dict[str, Any]:
    """Builds the canonical JSON evidence structure defined in Spec Section 17."""
    evidence_items = []
    for ev in evidence_list[:6]:  # Keep the most relevant evidence items
        evidence_items.append({
            "source": ev.source_type,
            "raw_score": ev.raw_score,
            "score": round(ev.normalized_score, 2),
            "date": ev.timestamp.strftime("%Y-%m-%d"),
            "weight": round(ev.confidence, 2),
            "description": f"{ev.source_type.title()} score: {int(ev.normalized_score * 100)}%"
        })

    return {
        "skill": skill.name,
        "mastery": round(mastery_score, 2),
        "confidence": round(confidence_score, 2),
        "severity": round(severity_score, 2),
        "priority": round(priority_score, 2),
        "reason_codes": reason_codes,
        "evidence": evidence_items
    }

def format_natural_explanation(structured_exp: Dict[str, Any]) -> str:
    """
    Renders deterministic, evidence-backed natural language explanation
    answering the 5 required questions:
    1. What skill is weak?
    2. How strong/weak is the estimate?
    3. What evidence supports it?
    4. How confident is the system?
    5. What should the student do next?
    """
    skill_name = structured_exp["skill"]
    mastery_pct = int(structured_exp["mastery"] * 100)
    conf_val = structured_exp["confidence"]
    conf_pct = int(conf_val * 100)
    reasons = structured_exp["reason_codes"]
    evidence = structured_exp["evidence"]

    # Handle Section 46: Low Confidence Behavior
    if conf_val < 0.40 or "EARLY_SIGNAL_NEEDS_VERIFICATION" in reasons:
        return (
            f"Early signal for {skill_name} (estimated mastery: {mastery_pct}%). "
            f"Because you have only completed {len(evidence)} initial assessment item(s), "
            f"the system confidence is currently low ({conf_pct}%). More evidence is needed before confirming a skill deficit. "
            f"We recommend reviewing the foundational concepts and taking a quick practice check."
        )

    # High or moderate confidence explanation
    source_counts = {}
    for ev in evidence:
        s = ev["source"].title()
        source_counts[s] = source_counts.get(s, 0) + 1
    
    source_summary = ", ".join([f"{count} {src.lower()} record(s)" for src, count in source_counts.items()])
    if not source_summary:
        source_summary = "historical coursework"

    confidence_phrase = "high confidence" if conf_val >= 0.75 else "moderate confidence"
    
    body = (
        f"You need additional practice with {skill_name}. Your estimated mastery is {mastery_pct}%, "
        f"derived from {source_summary}. "
    )

    if "MULTIPLE_SOURCES_AGREE" in reasons:
        body += "Multiple independent assessments consistently show difficulty in this area. "
    elif "LOW_RECENT_PERFORMANCE" in reasons:
        body += "Your most recent attempts indicated conceptual challenges. "
    
    if "FOUNDATIONAL_PREREQUISITE_DEFICIT" in reasons:
        body += "Note: Mastering this skill is critical because several advanced topics depend directly on it. "

    body += (
        f"The diagnostic engine has {confidence_phrase} ({conf_pct}%) in this assessment. "
        f"Next step: Start with the curated learning modules below, work through the practice examples, "
        f"and complete the targeted reassessment to verify your mastery."
    )

    return body

