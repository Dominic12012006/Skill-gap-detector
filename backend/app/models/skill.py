from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

skill_prerequisites = Table(
    "skill_prerequisites",
    Base.metadata,
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
    Column("prerequisite_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    parent_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(Float, default=0.5)  # 0.0 - 1.0

    subject = relationship("Subject", back_populates="skills")
    subskills = relationship("Skill", backref="parent_skill", remote_side=[id])

    prerequisites = relationship(
        "Skill",
        secondary=skill_prerequisites,
        primaryjoin=id == skill_prerequisites.c.skill_id,
        secondaryjoin=id == skill_prerequisites.c.prerequisite_id,
        backref="dependent_skills"
    )

    resources = relationship("Resource", back_populates="skill", cascade="all, delete-orphan")
    assessment_items = relationship("AssessmentItem", back_populates="skill")

