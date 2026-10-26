from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.gap import Gap
from app.models.skill import Skill
from app.models.reassessment import Reassessment
from app.models.assessment import Assessment, AssessmentItem, StudentResponse
from app.services.evidence_service import record_evidence
from app.services.mastery_service import update_skill_mastery
from app.services.gap_detection_service import detect_and_rank_gaps
from app.config import settings

def process_reassessment_submission(
    db: Session,
    student_id: int,
    gap_id: int,
    assessment_id: int,
    answers: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates reassessment responses, creates high-weight REASSESSMENT evidence,
    recalculates skill mastery, computes improvement delta, and updates gap status.
    """
    gap = db.query(Gap).filter(Gap.id == gap_id, Gap.student_id == student_id).first()
    if not gap:
        raise ValueError("Gap not found for this student")

    skill_id = gap.skill_id
    pre_mastery = gap.mastery_score

    # Grade the answers
    correct_count = 0
    total_items = len(answers)

    for ans in answers:
        item = db.query(AssessmentItem).filter(AssessmentItem.id == ans["assessment_item_id"]).first()
        if not item:
            continue
        is_correct = (ans["selected_answer"].strip().lower() == item.correct_answer.strip().lower())
        score = 1.0 if is_correct else 0.0
        if is_correct:
            correct_count += 1

        resp = StudentResponse(
            student_id=student_id,
            assessment_item_id=item.id,
            answer=ans["selected_answer"],
            is_correct=is_correct,
            score=score,
            response_time_seconds=ans.get("response_time_seconds", 0.0),
            submitted_at=datetime.utcnow()
        )
        db.add(resp)

    db.commit()

    reassessment_score = (correct_count / total_items) if total_items > 0 else 0.0
    percentage = reassessment_score * 100.0

    # Ingest REASSESSMENT evidence (weight 1.00)
    record_evidence(
        db=db,
        student_id=student_id,
        skill_id=skill_id,
        source_type="REASSESSMENT",
        raw_score=percentage,
        max_score=100.0,
        correctness=reassessment_score >= 0.60,
        confidence=1.0,
        assessment_id=assessment_id,
        metadata={
            "action": "closed_loop_reassessment",
            "pre_mastery": pre_mastery,
            "correct_count": correct_count,
            "total_items": total_items
        }
    )

    # Recalculate mastery
    new_mastery_obj = update_skill_mastery(db, student_id, skill_id)
    post_mastery = new_mastery_obj.mastery_score
    improvement = round(post_mastery - pre_mastery, 4)

    # Determine status
    if post_mastery >= settings.GAP_MASTERY_THRESHOLD:
        status = "RESOLVED"
    elif improvement >= 0.15:
        status = "IMPROVED"
    else:
        status = "PERSISTENT"

    gap.status = status
    gap.mastery_score = post_mastery
    gap.severity_score = round(1.0 - post_mastery, 4)
    gap.updated_at = datetime.utcnow()
    db.commit()

    # Log Reassessment entity
    reassess_log = Reassessment(
        student_id=student_id,
        gap_id=gap.id,
        skill_id=skill_id,
        pre_mastery=pre_mastery,
        post_mastery=post_mastery,
        improvement=improvement,
        status=status,
        completed_at=datetime.utcnow()
    )
    db.add(reassess_log)
    db.commit()
    db.refresh(reassess_log)

    # Refresh gaps ranking
    detect_and_rank_gaps(db, student_id)

    skill = db.query(Skill).filter(Skill.id == skill_id).first()

    return {
        "reassessment_id": reassess_log.id,
        "gap_id": gap.id,
        "skill_id": skill_id,
        "skill_name": skill.name if skill else "",
        "pre_mastery": round(pre_mastery, 4),
        "post_mastery": round(post_mastery, 4),
        "improvement": improvement,
        "status": status,
        "correct_count": correct_count,
        "total_items": total_items,
        "score_percentage": round(percentage, 1),
        "completed_at": reassess_log.completed_at
    }

