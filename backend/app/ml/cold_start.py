from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.subject import Subject
from app.models.skill import Skill
from app.models.assessment import Assessment

def get_onboarding_diagnostic(db: Session, subject_id: int) -> Dict[str, Any]:
    """
    Finds or constructs a diagnostic assessment covering representative skills
    for cold-start onboarding.
    """
    diagnostic = (
        db.query(Assessment)
        .filter(Assessment.subject_id == subject_id, Assessment.type == "DIAGNOSTIC")
        .first()
    )
    if not diagnostic:
        return {}

    return {
        "assessment_id": diagnostic.id,
        "title": diagnostic.title,
        "subject_id": subject_id,
        "item_count": len(diagnostic.items),
        "items": [
            {
                "id": item.id,
                "skill_id": item.skill_id,
                "skill_name": item.skill.name if item.skill else "",
                "question": item.question,
                "options": item.options_json,
                "difficulty": item.difficulty
            }
            for item in diagnostic.items
        ]
    }

