from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    gap_id = Column(Integer, ForeignKey("gaps.id"), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    ranking_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="RECOMMENDED")  # RECOMMENDED, STARTED, COMPLETED
    recommended_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    student = relationship("User")
    gap = relationship("Gap", back_populates="recommendations")
    resource = relationship("Resource", back_populates="recommendations")

