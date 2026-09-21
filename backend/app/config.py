"""
Backend Configuration Module

Uses pathlib for portable, relative path resolution across any Windows machine.
"""
from pathlib import Path
from pydantic import BaseModel

# Project directory resolution
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Database configuration (relative path inside backend directory)
DB_PATH = BACKEND_DIR / "analyzer.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Model caching directory (relative path inside backend directory)
MODEL_CACHE_DIR = BACKEND_DIR / "models_cache"


class Settings(BaseModel):
    app_name: str = "Smart Sentiment & Emotion Analyzer"
    version: str = "1.0.0"
    host: str = "127.0.0.1"
    port: int = 8000
    database_url: str = DATABASE_URL
    model_cache_dir: Path = MODEL_CACHE_DIR


settings = Settings()
