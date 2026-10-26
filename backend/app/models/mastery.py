from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Mastery(Base):
    __tablename__ = "masteries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    mastery_score = Column(Float, nullable=False, default=0.5)  # [0.0, 1.0]
    confidence_score = Column(Float, nullable=False, default=0.0)  # [0.0, 1.0]
    evidence_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_student_skill_mastery"),
    )

    student = relationship("User")
    skill = relationship("Skill")

