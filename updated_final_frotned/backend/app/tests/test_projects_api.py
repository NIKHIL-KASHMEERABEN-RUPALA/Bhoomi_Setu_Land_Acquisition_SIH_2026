import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_projects_list(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 5
    assert len(data["items"]) >= 5


@pytest.mark.asyncio
async def test_get_project_detail(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/projects/p-001",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "p-001"
    assert "Ahmedabad" in data["name"]
    assert "district" in data


@pytest.mark.asyncio
async def test_get_project_timeline(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/projects/p-001/timeline",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "projectId" in data
    assert "lifecycleStages" in data
    assert "milestones" in data


@pytest.mark.asyncio
async def test_dashboard_overview(client: AsyncClient, central_admin_token: str):
    response = await client.get(
        "/api/v1/dashboard/overview",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "totalMonitoredProjects" in data
    assert data["totalMonitoredProjects"] >= 5
    assert "criticalProjects" in data
    assert "totalPortfolioBudgetCrores" in data
