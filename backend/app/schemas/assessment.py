from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel

class AssessmentItemOut(BaseModel):
    id: int
    skill_id: int
    skill_name: Optional[str] = None
    question: str
    difficulty: float
    options: List[str]
    # correct_answer is omitted in student-facing response to prevent cheating

class AssessmentOut(BaseModel):
    id: int
    subject_id: int
    subject_name: Optional[str] = None
    title: str
    type: str  # DIAGNOSTIC, QUIZ, REASSESSMENT
    target_skill_id: Optional[int] = None
    description: Optional[str] = None
    items_count: int
    items: Optional[List[AssessmentItemOut]] = None

class ItemAnswerSubmit(BaseModel):
    assessment_item_id: int
    selected_answer: str
    response_time_seconds: Optional[float] = 0.0

class AssessmentSubmit(BaseModel):
    answers: List[ItemAnswerSubmit]

class AssessmentResultItem(BaseModel):
    assessment_item_id: int
    question: str
    skill_id: int
    skill_name: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    score: float
    explanation: Optional[str] = None

class AssessmentResultOut(BaseModel):
    assessment_id: int
    title: str
    total_questions: int
    correct_count: int
    percentage: float
    items: List[AssessmentResultItem]
    skills_updated: List[str]

