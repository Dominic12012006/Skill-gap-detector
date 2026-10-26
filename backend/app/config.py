import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Learning Platform Skill Gap Identifier"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skillgap_secret_key_antigravity_2026_supersecure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: Supports SQLite by default for zero-setup local dev, PostgreSQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillgap.db")
    
    # Optional LLM API Key (if provided, can be used for neural explanation polish)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Algorithm parameters (as defined in Antigravity Spec)
    GAP_MASTERY_THRESHOLD: float = 0.60
    RECENCY_LAMBDA: float = 0.05  # half-life ~ 14 days
    MIN_CONFIDENCE_THRESHOLD: float = 0.40
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

