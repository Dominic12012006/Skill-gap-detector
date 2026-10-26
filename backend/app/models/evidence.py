from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # QUIZ, ASSIGNMENT, GRADEBOOK, DIAGNOSTIC, SELF_REPORT, REASSESSMENT
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    raw_score = Column(Float, nullable=False)
    normalized_score = Column(Float, nullable=False)  # [0.0, 1.0]
    correctness = Column(Boolean, nullable=True)
    confidence = Column(Float, default=1.0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metadata_json = Column(Text, nullable=True)

    student = relationship("User")
    skill = relationship("Skill")
    assessment = relationship("Assessment")

