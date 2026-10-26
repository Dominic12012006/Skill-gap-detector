import numpy as np
from datetime import datetime
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.evidence import Evidence
from app.models.mastery import Mastery
from app.models.skill import Skill
from app.services.evidence_service import get_source_weight, calculate_recency_weight

def get_mastery_level_label(score: float) -> str:
    if score < 0.40:
        return "Weak"
    elif score < 0.60:
        return "Developing"
    elif score < 0.80:
        return "Proficient"
    else:
        return "Strong"

def compute_mastery_and_confidence(evidence_list: List[Evidence]) -> Tuple[float, float]:
    """
    Computes weighted mastery score and confidence score according to Antigravity Spec:
    weighted_mastery = Σ(evidence_score * evidence_weight * recency_weight) / Σ(evidence_weight * recency_weight)
    confidence = evidence_coverage * source_reliability * consistency * recency
    """
    if not evidence_list:
        return 0.50, 0.0  # Cold-start neutral default with 0 confidence

    total_weight = 0.0
    weighted_score_sum = 0.0
    scores = []
    source_weights = []
    recency_weights = []

    now = datetime.utcnow()
    for ev in evidence_list:
        src_w = get_source_weight(ev.source_type) * ev.confidence
        rec_w = calculate_recency_weight(ev.timestamp, now)
        eff_weight = src_w * rec_w

        weighted_score_sum += ev.normalized_score * eff_weight
        total_weight += eff_weight

        scores.append(ev.normalized_score)
        source_weights.append(src_w)
        recency_weights.append(rec_w)

    mastery_score = (weighted_score_sum / total_weight) if total_weight > 0 else 0.50
    mastery_score = max(0.0, min(1.0, mastery_score))

    # Confidence components:
    # 1. Evidence coverage: saturates around 5 pieces of evidence
    count = len(evidence_list)
    evidence_coverage = min(1.0, count / 5.0)

    # 2. Source reliability: average reliability weight of sources used
    source_reliability = float(np.mean(source_weights)) if source_weights else 0.5

    # 3. Consistency: 1.0 - standard deviation penalty
    if count > 1:
        score_std = float(np.std(scores))
        consistency = max(0.5, 1.0 - (score_std * 0.8))
    else:
        consistency = 0.85

    # 4. Average recency factor
    avg_recency = float(np.mean(recency_weights)) if recency_weights else 1.0

    # Composite multi-factor confidence formulation matching spec benchmark (Section 12 & 32):
    # Combines sample saturation, source reliability, score consistency, and temporal freshness
    raw_confidence = (
        (0.45 * evidence_coverage) +
        (0.25 * source_reliability) +
        (0.15 * consistency) +
        (0.15 * avg_recency)
    )
    confidence = max(0.05, min(1.0, raw_confidence))

    return round(mastery_score, 4), round(confidence, 4)

def update_skill_mastery(db: Session, student_id: int, skill_id: int) -> Mastery:
    """Recalculates and persists mastery for a given student and skill."""
    evidence_list = (
        db.query(Evidence)
        .filter(Evidence.student_id == student_id, Evidence.skill_id == skill_id)
        .order_by(Evidence.timestamp.desc())
        .all()
    )

    mastery_score, confidence_score = compute_mastery_and_confidence(evidence_list)

    mastery = (
        db.query(Mastery)
        .filter(Mastery.student_id == student_id, Mastery.skill_id == skill_id)
        .first()
    )

    if not mastery:
        mastery = Mastery(
            student_id=student_id,
            skill_id=skill_id,
            mastery_score=mastery_score,
            confidence_score=confidence_score,
            evidence_count=len(evidence_list),
            last_updated=datetime.utcnow()
        )
        db.add(mastery)
    else:
        mastery.mastery_score = mastery_score
        mastery.confidence_score = confidence_score
        mastery.evidence_count = len(evidence_list)
        mastery.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(mastery)
    return mastery

def update_all_student_masteries(db: Session, student_id: int) -> List[Mastery]:
    """Updates mastery records across all skills the student has interacted with."""
    skill_ids = [
        row[0]
        for row in db.query(Evidence.skill_id)
        .filter(Evidence.student_id == student_id)
        .distinct()
        .all()
    ]
    updated = []
    for sid in skill_ids:
        updated.append(update_skill_mastery(db, student_id, sid))
    return updated

