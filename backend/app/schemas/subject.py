from typing import List, Optional
from pydantic import BaseModel

class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class SubjectOut(SubjectBase):
    id: int

    class Config:
        from_attributes = True

