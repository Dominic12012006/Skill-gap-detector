import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.assessment import Assessment, AssessmentItem, StudentResponse
from app.models.gap import Gap
from app.models.skill import Skill
from app.models.user import User
from app.models.reassessment import Reassessment
from app.schemas.assessment import (
    AssessmentOut,
    AssessmentItemOut,
    AssessmentSubmit,
    AssessmentResultOut,
    AssessmentResultItem
)
from app.schemas.reassessment import ReassessmentOut
from app.services.auth_service import get_current_user
from app.services.evidence_service import record_evidence
from app.services.mastery_service import update_skill_mastery
from app.services.gap_detection_service import detect_and_rank_gaps
from app.services.reassessment_service import process_reassessment_submission

router = APIRouter(tags=["Assessments & Reassessments"])

def map_assessment_to_out(asm: Assessment, include_items: bool = True) -> AssessmentOut:
    items_out = None
    if include_items:
        items_out = []
        for it in asm.items:
            try:
                opts = json.loads(it.options_json)
            except Exception:
                opts = []
            items_out.append(
                AssessmentItemOut(
                    id=it.id,
                    skill_id=it.skill_id,
                    skill_name=it.skill.name if it.skill else "",
                    question=it.question,
                    difficulty=it.difficulty,
                    options=opts
                )
            )

    return AssessmentOut(
        id=asm.id,
        subject_id=asm.subject_id,
        subject_name=asm.subject.name if asm.subject else "",
        title=asm.title,
        type=asm.type,
        target_skill_id=asm.target_skill_id,
        description=asm.description,
        items_count=len(asm.items),
        items=items_out
    )

@router.get("/assessments", response_model=List[AssessmentOut])
def list_assessments(
    subject_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Assessment)
    if subject_id:
        query = query.filter(Assessment.subject_id == subject_id)
    if type:
        query = query.filter(Assessment.type == type.upper())
    
    asms = query.all()
    return [map_assessment_to_out(a, include_items=False) for a in asms]

@router.get("/assessments/{asm_id}", response_model=AssessmentOut)
def get_assessment(asm_id: int, db: Session = Depends(get_db)):
    asm = db.query(Assessment).filter(Assessment.id == asm_id).first()
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return map_assessment_to_out(asm, include_items=True)

@router.post("/assessments/{asm_id}/submit", response_model=AssessmentResultOut)
def submit_assessment(
    asm_id: int,
    submission: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    asm = db.query(Assessment).filter(Assessment.id == asm_id).first()
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found")

    correct_count = 0
    items_graded = []
    skills_impacted = set()
    skill_scores = {}  # skill_id -> list of scores

    for ans in submission.answers:
        item = db.query(AssessmentItem).filter(AssessmentItem.id == ans.assessment_item_id).first()
        if not item or item.assessment_id != asm.id:
            continue

        is_corr = (ans.selected_answer.strip().lower() == item.correct_answer.strip().lower())
        score = 1.0 if is_corr else 0.0
        if is_corr:
            correct_count += 1

        skills_impacted.add(item.skill_id)
        if item.skill_id not in skill_scores:
            skill_scores[item.skill_id] = []
        skill_scores[item.skill_id].append(score)

        resp = StudentResponse(
            student_id=current_user.id,
            assessment_item_id=item.id,
            answer=ans.selected_answer,
            is_correct=is_corr,
            score=score,
            response_time_seconds=ans.response_time_seconds or 0.0,
            submitted_at=datetime.utcnow()
        )
        db.add(resp)

        items_graded.append(
            AssessmentResultItem(
                assessment_item_id=item.id,
                question=item.question,
                skill_id=item.skill_id,
                skill_name=item.skill.name if item.skill else "",
                selected_answer=ans.selected_answer,
                correct_answer=item.correct_answer,
                is_correct=is_corr,
                score=score,
                explanation=item.explanation
            )
        )

    db.commit()

    total_q = len(items_graded)
    percentage = (correct_count / total_q * 100.0) if total_q > 0 else 0.0

    # Ingest evidence for each affected skill
    updated_skill_names = []
    source_type = "DIAGNOSTIC" if asm.type == "DIAGNOSTIC" else "QUIZ"

    for sid, sc_list in skill_scores.items():
        avg_score = (sum(sc_list) / len(sc_list)) * 100.0
        record_evidence(
            db=db,
            student_id=current_user.id,
            skill_id=sid,
            source_type=source_type,
            raw_score=avg_score,
            max_score=100.0,
            correctness=(avg_score >= 60.0),
            confidence=1.0,
            assessment_id=asm.id,
            metadata={"assessment_title": asm.title, "items_count": len(sc_list)}
        )
        update_skill_mastery(db, current_user.id, sid)
        sk = db.query(Skill).filter(Skill.id == sid).first()
        if sk:
            updated_skill_names.append(sk.name)

    detect_and_rank_gaps(db, current_user.id)

    return AssessmentResultOut(
        assessment_id=asm.id,
        title=asm.title,
        total_questions=total_q,
        correct_count=correct_count,
        percentage=round(percentage, 1),
        items=items_graded,
        skills_updated=updated_skill_names
    )

@router.post("/gaps/{gap_id}/reassess")
def reassess_gap(
    gap_id: int,
    submission: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gap = db.query(Gap).filter(Gap.id == gap_id, Gap.student_id == current_user.id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Skill gap not found")

    # Find or use the reassessment assessment for this skill
    reassess_asm = (
        db.query(Assessment)
        .filter(Assessment.target_skill_id == gap.skill_id, Assessment.type == "REASSESSMENT")
        .first()
    )
    asm_id = reassess_asm.id if reassess_asm else 1

    answers_payload = [
        {
            "assessment_item_id": a.assessment_item_id,
            "selected_answer": a.selected_answer,
            "response_time_seconds": a.response_time_seconds
        }
        for a in submission.answers
    ]

    result = process_reassessment_submission(
        db=db,
        student_id=current_user.id,
        gap_id=gap_id,
        assessment_id=asm_id,
        answers=answers_payload
    )
    return result

@router.get("/students/me/reassessments", response_model=List[ReassessmentOut])
def get_my_reassessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = (
        db.query(Reassessment)
        .filter(Reassessment.student_id == current_user.id)
        .order_by(Reassessment.completed_at.desc())
        .all()
    )
    return [
        ReassessmentOut(
            id=r.id,
            student_id=r.student_id,
            gap_id=r.gap_id,
            skill_id=r.skill_id,
            skill_name=r.skill.name if r.skill else "",
            pre_mastery=r.pre_mastery,
            post_mastery=r.post_mastery,
            improvement=r.improvement,
            status=r.status,
            completed_at=r.completed_at
        )
        for r in records
    ]

