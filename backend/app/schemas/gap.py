from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ContributingEvidence(BaseModel):
    source: str
    raw_score: float
    score: float
    date: str
    weight: float
    description: Optional[str] = None

class GapOut(BaseModel):
    id: int
    student_id: int
    skill_id: int
    skill_name: str
    skill_code: str
    subject_id: int
    subject_name: str
    mastery_score: float
    severity_score: float
    confidence_score: float
    priority_score: float
    status: str  # OPEN, IN_PROGRESS, IMPROVED, RESOLVED, PERSISTENT
    explanation: Optional[str] = None
    reason_codes: List[str] = []
    evidence_count: int
    evidence: List[ContributingEvidence] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DiagnosisResponse(BaseModel):
    student_id: int
    total_gaps: int
    gaps: List[GapOut]

