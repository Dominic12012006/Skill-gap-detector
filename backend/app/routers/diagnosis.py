import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.gap import Gap
from app.models.user import User
from app.models.evidence import Evidence
from app.schemas.gap import GapOut, DiagnosisResponse, ContributingEvidence
from app.services.auth_service import get_current_user
from app.services.mastery_service import update_all_student_masteries
from app.services.gap_detection_service import detect_and_rank_gaps
from app.services.recommendation_service import refresh_student_recommendations

router = APIRouter(prefix="/students/me", tags=["Diagnosis & Gaps"])

def map_gap_to_out(gap: Gap, db: Session) -> GapOut:
    reason_codes = []
    if gap.reason_codes_json:
        try:
            reason_codes = json.loads(gap.reason_codes_json)
        except Exception:
            reason_codes = []

    evidence_items = []
    if gap.evidence_summary_json:
        try:
            struct = json.loads(gap.evidence_summary_json)
            for e in struct.get("evidence", []):
                evidence_items.append(
                    ContributingEvidence(
                        source=e.get("source", "UNKNOWN"),
                        raw_score=e.get("raw_score", 0.0),
                        score=e.get("score", 0.0),
                        date=e.get("date", ""),
                        weight=e.get("weight", 1.0),
                        description=e.get("description", "")
                    )
                )
        except Exception:
            evidence_items = []

    # If no evidence in summary, query from db directly
    if not evidence_items:
        db_evs = (
            db.query(Evidence)
            .filter(Evidence.student_id == gap.student_id, Evidence.skill_id == gap.skill_id)
            .order_by(Evidence.timestamp.desc())
            .limit(5)
            .all()
        )
        for ev in db_evs:
            evidence_items.append(
                ContributingEvidence(
                    source=ev.source_type,
                    raw_score=ev.raw_score,
                    score=round(ev.normalized_score, 2),
                    date=ev.timestamp.strftime("%Y-%m-%d"),
                    weight=round(ev.confidence, 2),
                    description=f"{ev.source_type.title()} attempt"
                )
            )

    return GapOut(
        id=gap.id,
        student_id=gap.student_id,
        skill_id=gap.skill_id,
        skill_name=gap.skill.name if gap.skill else "",
        skill_code=gap.skill.code if gap.skill else "",
        subject_id=gap.skill.subject_id if gap.skill else 0,
        subject_name=gap.skill.subject.name if gap.skill and gap.skill.subject else "",
        mastery_score=gap.mastery_score,
        severity_score=gap.severity_score,
        confidence_score=gap.confidence_score,
        priority_score=gap.priority_score,
        status=gap.status,
        explanation=gap.explanation,
        reason_codes=reason_codes,
        evidence_count=len(evidence_items),
        evidence=evidence_items,
        created_at=gap.created_at,
        updated_at=gap.updated_at
    )

@router.get("/gaps", response_model=DiagnosisResponse)
def get_my_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gaps = (
        db.query(Gap)
        .filter(Gap.student_id == current_user.id, Gap.status.in_(["OPEN", "IN_PROGRESS", "IMPROVED", "PERSISTENT"]))
        .order_by(Gap.priority_score.desc())
        .all()
    )
    if not gaps:
        # Run detection if not yet run
        gaps = detect_and_rank_gaps(db, current_user.id)

    mapped_gaps = [map_gap_to_out(g, db) for g in gaps]
    return DiagnosisResponse(
        student_id=current_user.id,
        total_gaps=len(mapped_gaps),
        gaps=mapped_gaps
    )

@router.get("/gaps/{gap_id}", response_model=GapOut)
def get_gap_detail(
    gap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gap = db.query(Gap).filter(Gap.id == gap_id, Gap.student_id == current_user.id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Skill gap not found")
    return map_gap_to_out(gap, db)

@router.post("/diagnose", response_model=DiagnosisResponse)
def run_diagnosis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Recalculate all masteries and detect gaps
    update_all_student_masteries(db, current_user.id)
    gaps = detect_and_rank_gaps(db, current_user.id)
    refresh_student_recommendations(db, current_user.id)

    mapped_gaps = [map_gap_to_out(g, db) for g in gaps]
    return DiagnosisResponse(
        student_id=current_user.id,
        total_gaps=len(mapped_gaps),
        gaps=mapped_gaps
    )

