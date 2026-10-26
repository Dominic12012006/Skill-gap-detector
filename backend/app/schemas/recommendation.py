from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ResourceOut(BaseModel):
    id: int
    skill_id: int
    skill_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    resource_type: str  # VIDEO, ARTICLE, TUTORIAL, PRACTICE, QUIZ, DOCUMENTATION
    url: str
    difficulty: float
    estimated_minutes: int
    sequence_order: int

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    student_id: int
    gap_id: int
    resource_id: int
    resource: ResourceOut
    skill_id: int
    skill_name: str
    gap_priority: float
    ranking_score: float
    reason: Optional[str] = None
    status: str  # RECOMMENDED, STARTED, COMPLETED
    recommended_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

