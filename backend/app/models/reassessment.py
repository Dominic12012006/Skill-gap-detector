from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Reassessment(Base):
    __tablename__ = "reassessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    gap_id = Column(Integer, ForeignKey("gaps.id"), nullable=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    pre_mastery = Column(Float, nullable=False)
    post_mastery = Column(Float, nullable=False)
    improvement = Column(Float, nullable=False)  # post_mastery - pre_mastery
    status = Column(String(50), nullable=False)  # RESOLVED, IMPROVED, PERSISTENT
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User")
    gap = relationship("Gap")
    skill = relationship("Skill")

