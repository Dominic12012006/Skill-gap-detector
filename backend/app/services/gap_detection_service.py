import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.gap import Gap
from app.models.mastery import Mastery
from app.models.skill import Skill
from app.models.evidence import Evidence
from app.config import settings
from app.services.explanation_service import (
    generate_reason_codes,
    build_structured_explanation,
    format_natural_explanation
)

def compute_prerequisite_importance(skill: Skill) -> float:
    """Calculates importance weight based on number of dependent skills."""
    base_importance = 1.0
    dependent_count = len(skill.dependent_skills) if hasattr(skill, "dependent_skills") else 0
    # Add 0.10 for each downstream skill blocked by this prerequisite (cap at 1.40)
    return min(1.40, base_importance + (dependent_count * 0.10))

def detect_and_rank_gaps(db: Session, student_id: int) -> List[Gap]:
    """
    Evaluates student masteries, detects gaps below threshold,
    ranks them by priority = severity * confidence * importance,
    and attaches evidence-backed explanations.
    """
    masteries = db.query(Mastery).filter(Mastery.student_id == student_id).all()
    detected_gaps: List[Gap] = []

    for m in masteries:
        skill = db.query(Skill).filter(Skill.id == m.skill_id).first()
        if not skill:
            continue

        if m.mastery_score < settings.GAP_MASTERY_THRESHOLD:
            severity = round(1.0 - m.mastery_score, 4)
            importance = compute_prerequisite_importance(skill)
            priority = round(severity * m.confidence_score * importance, 4)

            # Retrieve evidence items
            ev_list = (
                db.query(Evidence)
                .filter(Evidence.student_id == student_id, Evidence.skill_id == skill.id)
                .order_by(Evidence.timestamp.desc())
                .all()
            )

            has_dep = len(skill.dependent_skills) > 0 if hasattr(skill, "dependent_skills") else False
            reason_codes = generate_reason_codes(
                m.mastery_score,
                m.confidence_score,
                ev_list,
                has_prerequisite_deficit=has_dep
            )

            struct_exp = build_structured_explanation(
                skill=skill,
                mastery_score=m.mastery_score,
                confidence_score=m.confidence_score,
                severity_score=severity,
                priority_score=priority,
                evidence_list=ev_list,
                reason_codes=reason_codes
            )

            natural_exp = format_natural_explanation(struct_exp)

            # Query existing gap
            gap = (
                db.query(Gap)
                .filter(Gap.student_id == student_id, Gap.skill_id == skill.id)
                .first()
            )

            if not gap:
                gap = Gap(
                    student_id=student_id,
                    skill_id=skill.id,
                    mastery_score=m.mastery_score,
                    severity_score=severity,
                    confidence_score=m.confidence_score,
                    priority_score=priority,
                    status="OPEN",
                    explanation=natural_exp,
                    reason_codes_json=json.dumps(reason_codes),
                    evidence_summary_json=json.dumps(struct_exp),
                    created_at=datetime.utcnow()
                )
                db.add(gap)
            else:
                gap.mastery_score = m.mastery_score
                gap.severity_score = severity
                gap.confidence_score = m.confidence_score
                gap.priority_score = priority
                gap.explanation = natural_exp
                gap.reason_codes_json = json.dumps(reason_codes)
                gap.evidence_summary_json = json.dumps(struct_exp)
                if gap.status == "RESOLVED" and m.mastery_score < settings.GAP_MASTERY_THRESHOLD:
                    gap.status = "OPEN"
                gap.updated_at = datetime.utcnow()

            detected_gaps.append(gap)
        else:
            # If skill was a gap before but now exceeds threshold, resolve it
            existing_gap = (
                db.query(Gap)
                .filter(Gap.student_id == student_id, Gap.skill_id == skill.id)
                .first()
            )
            if existing_gap and existing_gap.status != "RESOLVED":
                existing_gap.status = "RESOLVED"
                existing_gap.mastery_score = m.mastery_score
                existing_gap.severity_score = round(1.0 - m.mastery_score, 4)
                existing_gap.updated_at = datetime.utcnow()

    db.commit()

    # Refresh and order detected open/active gaps by descending priority
    active_gaps = (
        db.query(Gap)
        .filter(Gap.student_id == student_id, Gap.status.in_(["OPEN", "IN_PROGRESS", "IMPROVED", "PERSISTENT"]))
        .order_by(Gap.priority_score.desc())
        .all()
    )

    return active_gaps

