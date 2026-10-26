from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.gap import Gap
from app.models.resource import Resource
from app.models.recommendation import Recommendation

def generate_recommendations_for_gap(db: Session, gap: Gap) -> List[Recommendation]:
    """Generates and ranks curated recommendations for an active gap."""
    resources = (
        db.query(Resource)
        .filter(Resource.skill_id == gap.skill_id)
        .order_by(Resource.sequence_order.asc(), Resource.difficulty.asc())
        .all()
    )

    created_recs = []
    for res in resources:
        # Check if already recommended
        existing = (
            db.query(Recommendation)
            .filter(
                Recommendation.student_id == gap.student_id,
                Recommendation.gap_id == gap.id,
                Recommendation.resource_id == res.id
            )
            .first()
        )
        if existing:
            created_recs.append(existing)
            continue

        skill_match = 1.0
        # Difficulty matching: recommend resource slightly above or matching mastery
        diff_delta = abs(res.difficulty - (gap.mastery_score + 0.15))
        diff_match = max(0.5, 1.0 - diff_delta)
        gap_prio_factor = min(1.0, max(0.2, gap.priority_score * 1.5))
        pref_match = 1.0

        ranking_score = round(skill_match * diff_match * gap_prio_factor * pref_match, 4)
        reason = (
            f"Targeted for {res.resource_type.lower()} learners with {int(gap.mastery_score * 100)}% "
            f"current mastery. Covers key gaps identified in your recent assessments."
        )

        rec = Recommendation(
            student_id=gap.student_id,
            gap_id=gap.id,
            resource_id=res.id,
            ranking_score=ranking_score,
            reason=reason,
            status="RECOMMENDED",
            recommended_at=datetime.utcnow()
        )
        db.add(rec)
        created_recs.append(rec)

    db.commit()
    for r in created_recs:
        db.refresh(r)
    return created_recs

def refresh_student_recommendations(db: Session, student_id: int) -> List[Recommendation]:
    """Ensures all active gaps have generated recommendations."""
    active_gaps = (
        db.query(Gap)
        .filter(Gap.student_id == student_id, Gap.status.in_(["OPEN", "IN_PROGRESS", "IMPROVED", "PERSISTENT"]))
        .all()
    )
    all_recs = []
    for gap in active_gaps:
        all_recs.extend(generate_recommendations_for_gap(db, gap))

    return (
        db.query(Recommendation)
        .filter(Recommendation.student_id == student_id)
        .order_by(Recommendation.ranking_score.desc())
        .all()
    )

def start_recommendation(db: Session, rec_id: int, student_id: int) -> Optional[Recommendation]:
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.id == rec_id, Recommendation.student_id == student_id)
        .first()
    )
    if rec and rec.status == "RECOMMENDED":
        rec.status = "STARTED"
        rec.started_at = datetime.utcnow()
        if rec.gap and rec.gap.status == "OPEN":
            rec.gap.status = "IN_PROGRESS"
        db.commit()
        db.refresh(rec)
    return rec

def complete_recommendation(db: Session, rec_id: int, student_id: int) -> Optional[Recommendation]:
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.id == rec_id, Recommendation.student_id == student_id)
        .first()
    )
    if rec:
        rec.status = "COMPLETED"
        rec.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(rec)
    return rec

