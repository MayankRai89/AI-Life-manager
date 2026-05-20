@echo off
echo Starting AI Life Manager Development Environment...

cd %~dp0\..\backend

IF NOT EXIST venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Starting PostgreSQL and Redis containers...
docker-compose up postgres redis -d

echo Starting the backend server...
uvicorn main:app --reload

pause
