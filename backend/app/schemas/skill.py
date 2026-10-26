from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class SkillBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    difficulty: float = 0.5

class SkillOut(SkillBase):
    id: int
    subject_id: int
    parent_skill_id: Optional[int] = None
    prerequisite_ids: List[int] = []

    class Config:
        from_attributes = True

class SkillMasteryOut(BaseModel):
    skill_id: int
    skill_name: str
    skill_code: str
    subject_id: int
    subject_name: str
    difficulty: float
    mastery_score: float
    confidence_score: float
    evidence_count: int
    mastery_level: str  # Weak, Developing, Proficient, Strong
    has_gap: bool
    last_updated: Optional[datetime] = None

