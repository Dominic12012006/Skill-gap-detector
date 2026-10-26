import math
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.evidence import Evidence
from app.config import settings

# Source weights specified in Section 11 of the Antigravity Spec
SOURCE_WEIGHTS: Dict[str, float] = {
    "DIAGNOSTIC": 1.00,
    "REASSESSMENT": 1.00,
    "QUIZ": 0.85,
    "ASSIGNMENT": 0.90,
    "GRADEBOOK": 0.75,
    "SELF_REPORT": 0.40,
}

def normalize_score(raw_score: float, max_score: float = 100.0) -> float:
    """Normalizes score to [0.0, 1.0] range."""
    if max_score <= 0:
        return 0.0
    norm = raw_score / max_score
    return max(0.0, min(1.0, norm))

def calculate_recency_weight(evidence_timestamp: datetime, now: Optional[datetime] = None) -> float:
    """Computes exponential decay recency weight: exp(-lambda * age_in_days)."""
    if now is None:
        now = datetime.utcnow()
    
    # Handle timezone differences if any
    if evidence_timestamp.tzinfo is not None:
        evidence_timestamp = evidence_timestamp.replace(tzinfo=None)
    if now.tzinfo is not None:
        now = now.replace(tzinfo=None)
        
    age_in_days = max(0.0, (now - evidence_timestamp).total_seconds() / 86400.0)
    decay = math.exp(-settings.RECENCY_LAMBDA * age_in_days)
    return max(0.1, min(1.0, decay))

def get_source_weight(source_type: str) -> float:
    return SOURCE_WEIGHTS.get(source_type.upper(), 0.70)

def record_evidence(
    db: Session,
    student_id: int,
    skill_id: int,
    source_type: str,
    raw_score: float,
    max_score: float = 100.0,
    correctness: Optional[bool] = None,
    confidence: float = 1.0,
    assessment_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    timestamp: Optional[datetime] = None
) -> Evidence:
    """Ingests, normalizes, and logs student evidence."""
    normalized_score = normalize_score(raw_score, max_score)
    if correctness is None:
        correctness = normalized_score >= 0.60

    metadata_str = json.dumps(metadata) if metadata else None
    ev = Evidence(
        student_id=student_id,
        skill_id=skill_id,
        source_type=source_type.upper(),
        assessment_id=assessment_id,
        raw_score=raw_score,
        normalized_score=normalized_score,
        correctness=correctness,
        confidence=confidence,
        timestamp=timestamp or datetime.utcnow(),
        metadata_json=metadata_str
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

