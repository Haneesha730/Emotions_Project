"""
Pydantic Request & Response Schemas

Enforces input validation and structured API JSON contracts.
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class AnalysisRequest(BaseModel):
    text: str = Field(
        ...,
        description="Text content to analyze for sentiment, emotion, and keywords",
        example="I am feeling wonderful today and excited for the new project!"
    )

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        if v is None:
            raise ValueError("Text input is required.")
        
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Text input cannot be empty or contain only whitespace.")
        
        if len(cleaned) > 1000:
            raise ValueError(f"Text exceeds maximum allowed length of 1000 characters (got {len(cleaned)} characters).")
        
        return cleaned


class AnalysisResultData(BaseModel):
    """Internal schema for NLP pipeline output"""
    sentiment: str
    sentiment_confidence: float
    positive_score: float
    negative_score: float
    emotion: str
    emotion_confidence: float
    emotion_scores: Dict[str, float]
    keywords: List[str]
    word_count: int
    character_count: int


class AnalysisRecordResponse(BaseModel):
    """Public schema for an analysis history record"""
    id: int
    text: str
    sentiment: str
    sentiment_confidence: float
    positive_score: float
    negative_score: float
    emotion: str
    emotion_confidence: float
    emotion_scores: Dict[str, float]
    keywords: List[str]
    word_count: int
    character_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    items: List[AnalysisRecordResponse]
    total: int


class StatsResponse(BaseModel):
    total_analyses: int
    sentiment_counts: Dict[str, int]
    emotion_counts: Dict[str, int]
    average_sentiment_confidence: float
    average_emotion_confidence: float


class HealthResponse(BaseModel):
    status: str
    service: str
    nlp_engine_ready: bool = False


class MessageResponse(BaseModel):
    message: str
    deleted_count: Optional[int] = None
