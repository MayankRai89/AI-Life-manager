# AI Life Manager - Start All Services
$env:PYTHONUTF8 = "1"


Write-Host "Starting Docker containers (Postgres & Redis)..."
docker-compose up postgres redis -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start Docker containers. Is Docker Desktop running?"
    exit 1
}

Write-Host "Activating virtual environment..."
$env:VIRTUAL_ENV = "$PSScriptRoot\.venv"
$env:Path = "$env:VIRTUAL_ENV\Scripts;$env:Path"

Write-Host "Starting Celery worker in a new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; `$env:PYTHONUTF8 = '1'; . .\.venv\Scripts\Activate.ps1; celery -A workers.celery_app worker --pool=solo --loglevel=info"

Write-Host "Starting Celery beat scheduler in a new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; `$env:PYTHONUTF8 = '1'; . .\.venv\Scripts\Activate.ps1; celery -A workers.celery_app beat --loglevel=info"

Write-Host "Starting FastAPI server..."
# The main terminal continues to run uvicorn
uvicorn main:app --reload
