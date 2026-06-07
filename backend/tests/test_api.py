import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "TokenSaver" in response.json()["message"]

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_compress_api():
    response = client.post("/api/v1/compress", json={
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello"}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "tokens_before" in data
    assert "tokens_after" in data
    assert "savings_percentage" in data
    assert data["tokens_after"] < data["tokens_before"]

def test_compress_with_json_array():
    response = client.post("/api/v1/compress", json={
        "model": "gpt-4o",
        "messages": [
            {"role": "tool", "content": '[{"name": "test", "value": 123}, {"name": "test2", "value": 456}]'}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["savings_percentage"] > 60
