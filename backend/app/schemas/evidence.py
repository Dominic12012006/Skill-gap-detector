from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class EvidenceCreate(BaseModel):
    skill_id: int
    source_type: str  # QUIZ, ASSIGNMENT, GRADEBOOK, DIAGNOSTIC, SELF_REPORT, REASSESSMENT
    raw_score: float
    max_score: Optional[float] = 100.0
    correctness: Optional[bool] = None
    confidence: Optional[float] = 1.0
    metadata: Optional[Dict[str, Any]] = None

class EvidenceOut(BaseModel):
    id: int
    student_id: int
    skill_id: int
    skill_name: Optional[str] = None
    source_type: str
    assessment_id: Optional[int] = None
    raw_score: float
    normalized_score: float
    correctness: Optional[bool] = None
    confidence: float
    timestamp: datetime
    metadata_json: Optional[str] = None

    class Config:
        from_attributes = True

