@echo off
echo ===================================================
echo  Launching Smart Sentiment & Emotion Analyzer...
echo ===================================================

cd /d "%~dp0"

if not exist ".venv" (
    echo Error: .venv virtual environment not found. Please run setup_env.bat first.
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo Starting Backend Server on http://127.0.0.1:8000 ...
python backend\run_backend.py

pause
