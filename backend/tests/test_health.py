import os

from fastapi.testclient import TestClient

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/ai_life_manager_test",
)
os.environ.setdefault(
    "SYNC_DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/ai_life_manager_test",
)
os.environ.setdefault("OPENAI_API_KEY", "test-key")

from main import app  # noqa: E402


def test_health_endpoint_returns_app_status():
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "app": "AI Life Manager",
        "env": "development",
        "model": "gpt-4o-mini",
    }
