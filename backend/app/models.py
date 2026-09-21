"""
SQLAlchemy Data Models

Defines the database schema for analysis records stored in SQLite.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    text = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, index=True)
    sentiment_confidence = Column(Float, nullable=False)
    positive_score = Column(Float, nullable=False, default=0.0)
    negative_score = Column(Float, nullable=False, default=0.0)
    emotion = Column(String(20), nullable=False, index=True)
    emotion_confidence = Column(Float, nullable=False)
    emotion_scores = Column(Text, nullable=False)  # JSON string of all mapped emotion scores
    keywords = Column(Text, nullable=False)        # JSON string of extracted keywords
    word_count = Column(Integer, nullable=False)
    character_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
