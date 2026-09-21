"""
Services & Business Logic Layer

Handles SQLite CRUD operations, aggregate statistics, and coordinates NLP engine calls.
"""
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models import AnalysisRecord
from app.schemas import (
    AnalysisResultData,
    AnalysisRecordResponse,
    StatsResponse
)
from app.nlp_engine import nlp_engine


def format_record_response(record: AnalysisRecord) -> AnalysisRecordResponse:
    """Helper function to parse JSON fields and build Pydantic response model."""
    try:
        emotion_scores = json.loads(record.emotion_scores) if isinstance(record.emotion_scores, str) else record.emotion_scores
    except Exception:
        emotion_scores = {}

    try:
        keywords = json.loads(record.keywords) if isinstance(record.keywords, str) else record.keywords
    except Exception:
        keywords = []

    return AnalysisRecordResponse(
        id=record.id,
        text=record.text,
        sentiment=record.sentiment,
        sentiment_confidence=record.sentiment_confidence,
        positive_score=getattr(record, "positive_score", 0.0),
        negative_score=getattr(record, "negative_score", 0.0),
        emotion=record.emotion,
        emotion_confidence=record.emotion_confidence,
        emotion_scores=emotion_scores,
        keywords=keywords,
        word_count=record.word_count,
        character_count=record.character_count,
        created_at=record.created_at
    )


def run_analysis_and_save(db: Session, text: str) -> AnalysisRecordResponse:
    """
    Executes real NLP analysis on text input and persists the record into SQLite.
    """
    try:
        # Execute real NLP inference (loads models on demand if needed)
        result: AnalysisResultData = nlp_engine.analyze(text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"NLP analysis execution failed: {str(e)}"
        )

    # Persist record to SQLite database
    record = AnalysisRecord(
        text=text,
        sentiment=result.sentiment,
        sentiment_confidence=result.sentiment_confidence,
        positive_score=result.positive_score,
        negative_score=result.negative_score,
        emotion=result.emotion,
        emotion_confidence=result.emotion_confidence,
        emotion_scores=json.dumps(result.emotion_scores),
        keywords=json.dumps(result.keywords),
        word_count=result.word_count,
        character_count=result.character_count
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return format_record_response(record)


def get_analysis_history(db: Session, limit: int = 50) -> List[AnalysisRecordResponse]:
    """
    Retrieves saved analysis records from SQLite (newest first).
    """
    records = (
        db.query(AnalysisRecord)
        .order_by(AnalysisRecord.created_at.desc(), AnalysisRecord.id.desc())
        .limit(limit)
        .all()
    )
    return [format_record_response(r) for r in records]


def get_analysis_by_id(db: Session, analysis_id: int) -> AnalysisRecordResponse:
    """
    Retrieves a single analysis record by ID from SQLite.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis record with ID {analysis_id} not found."
        )
    return format_record_response(record)


def clear_analysis_history(db: Session) -> int:
    """
    Deletes all analysis history records from SQLite database without deleting the DB file.
    """
    deleted_count = db.query(AnalysisRecord).delete()
    db.commit()
    return deleted_count


def get_aggregate_stats(db: Session) -> StatsResponse:
    """
    Calculates statistics directly from SQLite records.
    Returns zero values and empty distributions if database is empty.
    """
    total_count = db.query(func.count(AnalysisRecord.id)).scalar() or 0

    default_sentiments = {"Positive": 0, "Negative": 0, "Neutral": 0}
    default_emotions = {
        "Happy": 0, "Sad": 0, "Angry": 0, "Fear": 0,
        "Surprise": 0, "Disgust": 0, "Neutral": 0
    }

    if total_count == 0:
        return StatsResponse(
            total_analyses=0,
            sentiment_counts=default_sentiments,
            emotion_counts=default_emotions,
            average_sentiment_confidence=0.0,
            average_emotion_confidence=0.0
        )

    # Calculate sentiment distribution
    sentiment_rows = (
        db.query(AnalysisRecord.sentiment, func.count(AnalysisRecord.id))
        .group_by(AnalysisRecord.sentiment)
        .all()
    )
    sentiment_counts = default_sentiments.copy()
    for s_name, count in sentiment_rows:
        if s_name in sentiment_counts:
            sentiment_counts[s_name] = count
        else:
            sentiment_counts[s_name] = count

    # Calculate emotion distribution
    emotion_rows = (
        db.query(AnalysisRecord.emotion, func.count(AnalysisRecord.id))
        .group_by(AnalysisRecord.emotion)
        .all()
    )
    emotion_counts = default_emotions.copy()
    for e_name, count in emotion_rows:
        if e_name in emotion_counts:
            emotion_counts[e_name] = count
        else:
            emotion_counts[e_name] = count

    # Calculate confidence averages
    avg_sent_conf = (
        db.query(func.avg(AnalysisRecord.sentiment_confidence)).scalar() or 0.0
    )
    avg_emo_conf = (
        db.query(func.avg(AnalysisRecord.emotion_confidence)).scalar() or 0.0
    )

    return StatsResponse(
        total_analyses=total_count,
        sentiment_counts=sentiment_counts,
        emotion_counts=emotion_counts,
        average_sentiment_confidence=round(float(avg_sent_conf), 4),
        average_emotion_confidence=round(float(avg_emo_conf), 4)
    )
