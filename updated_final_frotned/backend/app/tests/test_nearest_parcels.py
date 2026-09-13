import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.api.v1.map import haversine_km, CORRIDOR_LAND_REGISTRY


def test_haversine_formula():
    # Test known distance: Bharuch (21.710, 72.998) to Vagra North (21.718, 73.008)
    dist = haversine_km(21.710, 72.998, 21.718, 73.008)
    assert 1.0 < dist < 2.0  # Approx 1.37 km


@pytest.mark.asyncio
async def test_nearest_parcels_default_bharuch():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/map/nearest-parcels?parcel_id=bharuch-impasse-target")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["anchor_parcel"]["id"] == "bharuch-impasse-target"
        
        parcels = data["nearest_parcels"]
        assert len(parcels) > 0

        # Verify #1 Ranked Parcel is strictly HIGH Priority with Zero Habitation
        top_pick = parcels[0]
        assert top_pick["priority_tier"] == "HIGH"
        assert top_pick["habitation_status"] == "none"
        assert top_pick["affected_families_count"] == 0
        assert top_pick["structures_count"] == 0
        assert top_pick["fast_track_eligible"] is True

        # Verify that all Zero Habitation parcels precede any Inhabited parcels
        found_inhabited = False
        for p in parcels:
            if p["habitation_status"] != "none":
                found_inhabited = True
            if found_inhabited:
                assert p["habitation_status"] != "none" or p["priority_tier"] != "HIGH"


@pytest.mark.asyncio
async def test_nearest_parcels_filter_zero_habitation_only():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/map/nearest-parcels?parcel_id=bharuch-impasse-target&filter_priority=zero_habitation_only"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        parcels = data["nearest_parcels"]

        # Every single returned parcel must have ZERO habitation
        for p in parcels:
            assert p["priority_tier"] == "HIGH"
            assert p["habitation_status"] == "none"
            assert p["affected_families_count"] == 0
            assert p["structures_count"] == 0


@pytest.mark.asyncio
async def test_all_parcels_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/map/parcels")
        assert response.status_code == 200
        data = response.json()
        assert "parcels" in data
        assert len(data["parcels"]) >= len(CORRIDOR_LAND_REGISTRY)
