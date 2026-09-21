"""
FastAPI Main Application Entrypoint
"""

from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, init_db
from app.nlp_engine import nlp_engine
from app.schemas import (
    AnalysisRequest,
    AnalysisRecordResponse,
    StatsResponse,
    HealthResponse,
    MessageResponse
)
from app import services


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup & shutdown lifecycle context manager.
    Initializes the SQLite database.
    NLP models are loaded only when analysis is requested.
    """
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="REST API for Smart Sentiment & Emotion Analyzer application",
    lifespan=lifespan
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = exc.errors()

    error_msg = (
        errors[0].get("msg", "Invalid request parameters.")
        if errors
        else "Validation error."
    )

    if "Value error, " in error_msg:
        error_msg = error_msg.replace("Value error, ", "")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": error_msg}
    )


# ----------------------------------------------------
# API ENDPOINTS
# ----------------------------------------------------

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        nlp_engine_ready=nlp_engine.is_ready()
    )


@app.post(
    "/api/analyze",
    response_model=AnalysisRecordResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Analysis"]
)
def analyze_text(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    return services.run_analysis_and_save(
        db=db,
        text=request.text
    )


@app.get(
    "/api/history",
    response_model=List[AnalysisRecordResponse],
    tags=["History"]
)
def get_history(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    return services.get_analysis_history(
        db=db,
        limit=limit
    )


@app.get(
    "/api/history/{id}",
    response_model=AnalysisRecordResponse,
    tags=["History"]
)
def get_history_by_id(
    id: int,
    db: Session = Depends(get_db)
):
    return services.get_analysis_by_id(
        db=db,
        analysis_id=id
    )


@app.delete(
    "/api/history",
    response_model=MessageResponse,
    tags=["History"]
)
def delete_all_history(
    db: Session = Depends(get_db)
):
    deleted_count = services.clear_analysis_history(db=db)

    return MessageResponse(
        message=f"Successfully cleared {deleted_count} analysis record(s).",
        deleted_count=deleted_count
    )


@app.get(
    "/api/stats",
    response_model=StatsResponse,
    tags=["Statistics"]
)
def get_statistics(
    db: Session = Depends(get_db)
):
    return services.get_aggregate_stats(db=db)