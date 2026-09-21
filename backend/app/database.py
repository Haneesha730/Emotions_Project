"""
Database Management Module

Sets up SQLite database with SQLAlchemy ORM and automatic table creation.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create SQLite Engine (connect_args={"check_same_thread": False} is required for SQLite in FastAPI)
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False
)

# Session factory for DB operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request
    and ensures clean closure after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Automatically initializes the SQLite database tables on application startup.
    """
    import app.models  # Ensure models are imported before creating tables
    Base.metadata.create_all(bind=engine)
