from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Gap(Base):
    __tablename__ = "gaps"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    mastery_score = Column(Float, nullable=False)
    severity_score = Column(Float, nullable=False)  # 1.0 - mastery_score
    confidence_score = Column(Float, nullable=False)
    priority_score = Column(Float, nullable=False)  # severity * confidence * importance_weight
    status = Column(String(50), default="OPEN")  # OPEN, IN_PROGRESS, IMPROVED, RESOLVED, PERSISTENT
    explanation = Column(Text, nullable=True)
    reason_codes_json = Column(Text, nullable=True)  # JSON array of reasons
    evidence_summary_json = Column(Text, nullable=True)  # Structured evidence payload
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_student_skill_gap"),
    )

    student = relationship("User")
    skill = relationship("Skill")
    recommendations = relationship("Recommendation", back_populates="gap", cascade="all, delete-orphan")

