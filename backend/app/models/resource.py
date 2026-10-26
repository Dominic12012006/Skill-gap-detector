from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String(50), nullable=False)  # VIDEO, ARTICLE, TUTORIAL, PRACTICE, QUIZ, DOCUMENTATION
    url = Column(String(500), nullable=False)
    difficulty = Column(Float, default=0.5)
    estimated_minutes = Column(Integer, default=10)
    sequence_order = Column(Integer, default=1)  # 1: Concept, 2: Worked example, 3: Practice

    skill = relationship("Skill", back_populates="resources")
    recommendations = relationship("Recommendation", back_populates="resource")

