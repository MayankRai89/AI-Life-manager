# Start PostgreSQL and Redis
Write-Host "Starting Docker containers..."
docker-compose up postgres redis -d

# Check if containers started successfully
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start Docker containers. Make sure Docker Desktop is running."
    exit 1
}

# Activate virtual environment and run uvicorn
Write-Host "Activating virtual environment and starting FastAPI..."
$env:VIRTUAL_ENV = "$PSScriptRoot\venv"
$env:Path = "$env:VIRTUAL_ENV\Scripts;$env:Path"

uvicorn main:app --reload
