import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "BhoomiSetu" in data["service"]

    ready_resp = await client.get("/health/ready")
    assert ready_resp.status_code == 200
    ready_data = ready_resp.json()
    assert ready_data["status"] == "ready"
    assert ready_data["components"]["ml_inference_model"] == "loaded"


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@bhoomi.gov.in", "password": "Admin@Bhoomi2025!"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert "refresh_token" in payload
    assert payload["token_type"] == "bearer"
    assert payload["user"]["email"] == "admin@bhoomi.gov.in"
    assert payload["user"]["role"] == "central_admin"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@bhoomi.gov.in", "password": "WrongPassword!23"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_me(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    user_info = response.json()
    assert user_info["role"] == "central_admin"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "analyst@bhoomi.gov.in", "password": "Analyst@Bhoomi2025!"},
    )
    assert login_resp.status_code == 200
    refresh_token = login_resp.json()["refresh_token"]

    refresh_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
