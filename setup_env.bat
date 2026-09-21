@echo off
SETLOCAL EnableDelayedExpansion
echo ===================================================
echo  Smart Sentiment & Emotion Analyzer - Setup Environment
echo ===================================================

cd /d "%~dp0"

echo [1/3] Setting up Python virtual environment...
if not exist ".venv" (
    python -m venv .venv
    echo Virtual environment created in .venv
) else (
    echo Virtual environment .venv already exists.
)

echo [2/3] Installing Python backend dependencies...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

echo [3/3] Installing Node.js frontend dependencies...
if exist "frontend\package.json" (
    cd frontend
    call npm install
    cd ..
)

echo ===================================================
echo  Setup complete! Run 'run_app.bat' to launch the app.
echo ===================================================
pause
