from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.recommendation import RecommendationOut, ResourceOut
from app.services.auth_service import get_current_user
from app.services.recommendation_service import (
    refresh_student_recommendations,
    start_recommendation,
    complete_recommendation
)

router = APIRouter(tags=["Recommendations"])

def map_rec_to_out(rec: Recommendation) -> RecommendationOut:
    res = rec.resource
    return RecommendationOut(
        id=rec.id,
        student_id=rec.student_id,
        gap_id=rec.gap_id,
        resource_id=rec.resource_id,
        resource=ResourceOut(
            id=res.id,
            skill_id=res.skill_id,
            skill_name=res.skill.name if res.skill else "",
            title=res.title,
            description=res.description,
            resource_type=res.resource_type,
            url=res.url,
            difficulty=res.difficulty,
            estimated_minutes=res.estimated_minutes,
            sequence_order=res.sequence_order
        ),
        skill_id=rec.gap.skill_id if rec.gap else 0,
        skill_name=rec.gap.skill.name if rec.gap and rec.gap.skill else "",
        gap_priority=rec.gap.priority_score if rec.gap else 0.5,
        ranking_score=rec.ranking_score,
        reason=rec.reason,
        status=rec.status,
        recommended_at=rec.recommended_at,
        started_at=rec.started_at,
        completed_at=rec.completed_at
    )

@router.get("/students/me/recommendations", response_model=List[RecommendationOut])
def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.student_id == current_user.id)
        .order_by(Recommendation.ranking_score.desc())
        .all()
    )
    if not recs:
        recs = refresh_student_recommendations(db, current_user.id)

    return [map_rec_to_out(r) for r in recs]

@router.post("/recommendations/{rec_id}/start", response_model=RecommendationOut)
def start_rec(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = start_recommendation(db, rec_id, current_user.id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return map_rec_to_out(rec)

@router.post("/recommendations/{rec_id}/complete", response_model=RecommendationOut)
def complete_rec(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = complete_recommendation(db, rec_id, current_user.id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return map_rec_to_out(rec)

