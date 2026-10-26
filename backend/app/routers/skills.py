from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.skill import Skill
from app.models.subject import Subject
from app.models.mastery import Mastery
from app.models.user import User
from app.schemas.skill import SkillOut, SkillMasteryOut
from app.schemas.subject import SubjectOut
from app.services.auth_service import get_current_user
from app.services.mastery_service import get_mastery_level_label
from app.config import settings

router = APIRouter(tags=["Skills & Subjects"])

@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()

@router.get("/skills", response_model=List[SkillOut])
def list_skills(
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Skill)
    if subject_id:
        query = query.filter(Skill.subject_id == subject_id)
    skills = query.all()
    
    result = []
    for s in skills:
        item = SkillOut(
            id=s.id,
            subject_id=s.subject_id,
            parent_skill_id=s.parent_skill_id,
            name=s.name,
            code=s.code,
            description=s.description,
            difficulty=s.difficulty,
            prerequisite_ids=[p.id for p in s.prerequisites]
        )
        result.append(item)
    return result

@router.get("/skills/{skill_id}", response_model=SkillOut)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return SkillOut(
        id=skill.id,
        subject_id=skill.subject_id,
        parent_skill_id=skill.parent_skill_id,
        name=skill.name,
        code=skill.code,
        description=skill.description,
        difficulty=skill.difficulty,
        prerequisite_ids=[p.id for p in skill.prerequisites]
    )

@router.get("/students/me/skills", response_model=List[SkillMasteryOut])
def get_student_skills_mastery(
    subject_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Skill)
    if subject_id:
        query = query.filter(Skill.subject_id == subject_id)
    skills = query.all()

    # Pre-fetch student masteries
    masteries = {
        m.skill_id: m
        for m in db.query(Mastery).filter(Mastery.student_id == current_user.id).all()
    }

    result = []
    for s in skills:
        m = masteries.get(s.id)
        mastery_val = m.mastery_score if m else 0.50
        conf_val = m.confidence_score if m else 0.0
        ev_count = m.evidence_count if m else 0
        last_upd = m.last_updated if m else None

        has_gap = (m is not None and m.mastery_score < settings.GAP_MASTERY_THRESHOLD)
        level = get_mastery_level_label(mastery_val) if m else "Unassessed"

        result.append(
            SkillMasteryOut(
                skill_id=s.id,
                skill_name=s.name,
                skill_code=s.code,
                subject_id=s.subject_id,
                subject_name=s.subject.name if s.subject else "General",
                difficulty=s.difficulty,
                mastery_score=mastery_val,
                confidence_score=conf_val,
                evidence_count=ev_count,
                mastery_level=level,
                has_gap=has_gap,
                last_updated=last_upd
            )
        )
    return result

