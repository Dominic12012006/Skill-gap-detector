from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # DIAGNOSTIC, QUIZ, REASSESSMENT
    target_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)  # For focused reassessments
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="assessments")
    target_skill = relationship("Skill")
    items = relationship("AssessmentItem", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentItem(Base):
    __tablename__ = "assessment_items"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    question = Column(Text, nullable=False)
    difficulty = Column(Float, default=0.5)
    correct_answer = Column(String(255), nullable=False)
    options_json = Column(Text, nullable=False)  # JSON serialized list of choices
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="items")
    skill = relationship("Skill", back_populates="assessment_items")

class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_item_id = Column(Integer, ForeignKey("assessment_items.id"), nullable=False)
    answer = Column(String(255), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Float, nullable=False)  # [0.0, 1.0]
    response_time_seconds = Column(Float, default=0.0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User")
    assessment_item = relationship("AssessmentItem")

