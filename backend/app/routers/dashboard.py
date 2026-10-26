import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.mastery import Mastery
from app.models.gap import Gap
from app.models.skill import Skill
from app.models.subject import Subject
from app.models.reassessment import Reassessment
from app.services.auth_service import get_current_user
from app.services.mastery_service import get_mastery_level_label
from app.config import settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    masteries = db.query(Mastery).filter(Mastery.student_id == current_user.id).all()
    skills_assessed = len(masteries)

    strong_count = sum(1 for m in masteries if m.mastery_score >= 0.80)
    proficient_count = sum(1 for m in masteries if 0.60 <= m.mastery_score < 0.80)
    developing_count = sum(1 for m in masteries if 0.40 <= m.mastery_score < 0.60)
    weak_count = sum(1 for m in masteries if m.mastery_score < 0.40)

    # Active gaps
    gaps = (
        db.query(Gap)
        .filter(Gap.student_id == current_user.id, Gap.status.in_(["OPEN", "IN_PROGRESS", "IMPROVED", "PERSISTENT"]))
        .order_by(Gap.priority_score.desc())
        .limit(5)
        .all()
    )

    top_gaps = []
    for g in gaps:
        why = g.explanation or "Multiple evidence sources indicate below-expected proficiency."
        if len(why) > 140:
            why = why[:137] + "..."
        top_gaps.append({
            "gap_id": g.id,
            "skill_id": g.skill_id,
            "skill_name": g.skill.name if g.skill else "",
            "subject_name": g.skill.subject.name if g.skill and g.skill.subject else "",
            "mastery_score": g.mastery_score,
            "mastery_percentage": int(g.mastery_score * 100),
            "confidence_score": g.confidence_score,
            "confidence_percentage": int(g.confidence_score * 100),
            "severity_score": g.severity_score,
            "priority_score": g.priority_score,
            "status": g.status,
            "why_this_appears": why
        })

    # Subject breakdown
    subjects = db.query(Subject).all()
    subject_stats = []
    for subj in subjects:
        subj_skills = db.query(Skill).filter(Skill.subject_id == subj.id).all()
        subj_skill_ids = [s.id for s in subj_skills]
        subj_masteries = [m for m in masteries if m.skill_id in subj_skill_ids]

        avg_mastery = (
            sum(m.mastery_score for m in subj_masteries) / len(subj_masteries)
            if subj_masteries else 0.0
        )
        subject_stats.append({
            "subject_id": subj.id,
            "subject_name": subj.name,
            "total_skills": len(subj_skills),
            "assessed_skills": len(subj_masteries),
            "average_mastery": round(avg_mastery, 2),
            "average_percentage": int(avg_mastery * 100)
        })

    # Recent reassessments / improvements
    recent_reassessments = (
        db.query(Reassessment)
        .filter(Reassessment.student_id == current_user.id)
        .order_by(Reassessment.completed_at.desc())
        .limit(3)
        .all()
    )
    improvements = [
        {
            "id": r.id,
            "skill_name": r.skill.name if r.skill else "",
            "pre_mastery": int(r.pre_mastery * 100),
            "post_mastery": int(r.post_mastery * 100),
            "improvement": f"+{int(r.improvement * 100)}%",
            "status": r.status,
            "completed_at": r.completed_at
        }
        for r in recent_reassessments
    ]

    return {
        "student_name": current_user.name,
        "skills_assessed": skills_assessed,
        "strong_count": strong_count,
        "proficient_count": proficient_count,
        "developing_count": developing_count,
        "weak_count": weak_count,
        "high_priority_gaps_count": len(gaps),
        "top_gaps": top_gaps,
        "subjects": subject_stats,
        "recent_improvements": improvements
    }

