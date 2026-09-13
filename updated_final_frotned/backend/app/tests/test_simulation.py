import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_what_if_simulation_counterfactual(client: AsyncClient, central_admin_token: str):
    # Get initial baseline risk
    predict_res = await client.post(
        "/api/v1/projects/p-004/predict",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert predict_res.status_code == 200
    baseline_score = predict_res.json()["risk_score"]

    # Run What-If simulation with improved parameters:
    # fast-track compensation pendency down to 5% and increase continuous ROW to 95%
    sim_payload = {
        "changes": {
            "compensation_pending_pct": 5.0,
            "row_available_pct": 95.0,
            "interim_stays_active": 0.0,
        }
    }
    sim_res = await client.post(
        "/api/v1/projects/p-004/simulate",
        json=sim_payload,
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert data["projectId"] == "p-004"
    assert "currentProbability" in data
    assert "simulatedProbability" in data
    assert "probabilityDelta" in data
    assert "direction" in data
    assert data["direction"] in ["risk_reduced", "risk_increased", "neutral"]

    # Verify that database was NOT modified by simulation:
    # project detail must still hold original values
    proj_res = await client.get(
        "/api/v1/projects/p-004",
        headers={"Authorization": f"Bearer {central_admin_token}"},
    )
    assert proj_res.status_code == 200
    current_proj = proj_res.json()
    # Continuous ROW in DB is not 95.0, confirming counterfactual isolation
    assert current_proj["rowAvailablePct"] != 95.0
