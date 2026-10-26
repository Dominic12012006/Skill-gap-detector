from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evidence import Evidence
from app.models.skill import Skill
from app.models.user import User
from app.schemas.evidence import EvidenceCreate, EvidenceOut
from app.services.auth_service import get_current_user
from app.services.evidence_service import record_evidence
from app.services.mastery_service import update_skill_mastery
from app.services.gap_detection_service import detect_and_rank_gaps

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.post("", response_model=EvidenceOut)
def ingest_evidence(
    ev_in: EvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == ev_in.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    ev = record_evidence(
        db=db,
        student_id=current_user.id,
        skill_id=ev_in.skill_id,
        source_type=ev_in.source_type,
        raw_score=ev_in.raw_score,
        max_score=ev_in.max_score or 100.0,
        correctness=ev_in.correctness,
        confidence=ev_in.confidence or 1.0,
        metadata=ev_in.metadata
    )

    # Recalculate mastery and gaps automatically
    update_skill_mastery(db, current_user.id, ev_in.skill_id)
    detect_and_rank_gaps(db, current_user.id)

    return EvidenceOut(
        id=ev.id,
        student_id=ev.student_id,
        skill_id=ev.skill_id,
        skill_name=skill.name,
        source_type=ev.source_type,
        assessment_id=ev.assessment_id,
        raw_score=ev.raw_score,
        normalized_score=ev.normalized_score,
        correctness=ev.correctness,
        confidence=ev.confidence,
        timestamp=ev.timestamp,
        metadata_json=ev.metadata_json
    )

@router.get("/students/me/evidence", response_model=List[EvidenceOut])
def get_my_evidence(
    skill_id: Optional[int] = Query(None),
    source_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Evidence).filter(Evidence.student_id == current_user.id)
    if skill_id:
        query = query.filter(Evidence.skill_id == skill_id)
    if source_type:
        query = query.filter(Evidence.source_type == source_type.upper())

    records = query.order_by(Evidence.timestamp.desc()).limit(limit).all()

    result = []
    for r in records:
        result.append(
            EvidenceOut(
                id=r.id,
                student_id=r.student_id,
                skill_id=r.skill_id,
                skill_name=r.skill.name if r.skill else "",
                source_type=r.source_type,
                assessment_id=r.assessment_id,
                raw_score=r.raw_score,
                normalized_score=r.normalized_score,
                correctness=r.correctness,
                confidence=r.confidence,
                timestamp=r.timestamp,
                metadata_json=r.metadata_json
            )
        )
    return result

