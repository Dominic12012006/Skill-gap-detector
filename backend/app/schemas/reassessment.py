from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ReassessmentOut(BaseModel):
    id: int
    student_id: int
    gap_id: Optional[int] = None
    skill_id: int
    skill_name: str
    pre_mastery: float
    post_mastery: float
    improvement: float
    status: str  # RESOLVED, IMPROVED, PERSISTENT
    completed_at: datetime

    class Config:
        from_attributes = True

