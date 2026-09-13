import pytest
from httpx import AsyncClient
from app.inference.model_provider import get_model_provider


def test_model_provider_loads():
    provider = get_model_provider()
    assert provider.is_ready() is True
    assert provider.model is not None
    metadata = provider.get_metadata()
    assert metadata.get("version") == "1.0.0"
    schema = provider.get_schema()
    assert "features" in schema
    assert len(schema["features"]) == 18


@pytest.mark.asyncio
async def test_project_predict_endpoint(client: AsyncClient, central_admin_token: str):
    response = await client.post(
        "/api/v1/projects/p-004/predict",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "p-004"
    assert "risk_score" in data
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_level"] in ["Critical", "High", "Moderate", "Low"]
    assert "confidence" in data
    assert "factor_attributions" in data
    assert len(data["factor_attributions"]) > 0


@pytest.mark.asyncio
async def test_project_risk_history_endpoint(client: AsyncClient, central_admin_token: str):
    # Predict first to ensure history exists
    await client.post(
        "/api/v1/projects/p-004/predict",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    response = await client.get(
        "/api/v1/projects/p-004/risk-history",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["projectId"] == "p-004"
    assert "history" in data
    assert isinstance(data["history"], list)
    assert len(data["history"]) >= 1


@pytest.mark.asyncio
async def test_project_risk_explanation_endpoint(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/projects/p-004/risk/explanation",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["projectId"] == "p-004"
    assert "factors" in data
    assert len(data["factors"]) > 0
    assert "notice" in data


@pytest.mark.asyncio
async def test_project_recommendations_endpoint(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/projects/p-004/recommendations",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["projectId"] == "p-004"
    assert "items" in data
    assert isinstance(data["items"], list)
    if len(data["items"]) > 0:
        assert "recommended_action" in data["items"][0]
        assert "priority" in data["items"][0]
