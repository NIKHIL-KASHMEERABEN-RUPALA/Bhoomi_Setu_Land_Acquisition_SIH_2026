import pytest
from httpx import AsyncClient
from app.db.session import get_engine
from app.db.base import Base
import app.models


from sqlalchemy import delete
from app.models.group_land import GroupLandParcel


@pytest.fixture(autouse=True)
async def init_tables():
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(delete(GroupLandParcel).where(GroupLandParcel.parcel_identifier == "P-102"))


@pytest.mark.asyncio
async def test_group_land_flow(client: AsyncClient):
    # 1. Fetch group parcels (triggers auto-seeding of P-102)
    res = await client.get("/api/v1/group-land/parcels")
    assert res.status_code == 200
    parcels = res.json()
    assert len(parcels) >= 1

    p102_summary = next((p for p in parcels if p["parcel_identifier"] == "P-102"), None)
    assert p102_summary is not None
    assert p102_summary["total_owners"] == 3

    # 2. Get detail of P-102
    res_detail = await client.get(f"/api/v1/group-land/parcels/{p102_summary['id']}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    owners = detail["co_owners"]

    # Validate initial ownership percentages: Rahul 50%, Amit 30%, Priya 20%
    owner_map = {o["owner_name"]: o for o in owners}
    assert "Rahul Sharma" in owner_map
    assert "Amit Patel" in owner_map
    assert "Priya Desai" in owner_map

    assert owner_map["Rahul Sharma"]["ownership_percentage"] == 50.0
    assert owner_map["Amit Patel"]["ownership_percentage"] == 30.0
    assert owner_map["Priya Desai"]["ownership_percentage"] == 20.0

    # All initially Not Selling
    assert owner_map["Rahul Sharma"]["share_status"] == "Not Selling"
    assert owner_map["Priya Desai"]["share_status"] == "Not Selling"

    amit_id = owner_map["Amit Patel"]["id"]

    # 3. Test validation: cannot sell more than owned percentage
    res_invalid = await client.post(
        f"/api/v1/group-land/parcels/{p102_summary['id']}/sell-request",
        json={
            "co_owner_id": amit_id,
            "share_percentage": 45.0,  # Amit only owns 30%
            "asking_price": 6000000,
        },
    )
    assert res_invalid.status_code == 400
    assert "only owns 30.0%" in res_invalid.json()["detail"]

    # 4. Amit files "Sell My Share" for his 30%
    res_sell = await client.post(
        f"/api/v1/group-land/parcels/{p102_summary['id']}/sell-request",
        json={
            "co_owner_id": amit_id,
            "share_percentage": 30.0,
            "asking_price": 4500000,
            "reason": "Relocating to Sanand",
        },
    )
    assert res_sell.status_code == 200
    sale_req_id = res_sell.json()["sale_request_id"]

    # 5. Verify marketplace shows Amit's share
    res_market = await client.get("/api/v1/group-land/marketplace")
    assert res_market.status_code == 200
    market_items = res_market.json()
    amit_item = next((item for item in market_items if item["sale_request_id"] == sale_req_id), None)
    assert amit_item is not None
    assert amit_item["share_percentage_for_sale"] == 30.0
    assert amit_item["seller_name"] == "Amit Patel"

    # 6. Verify Rahul and Priya are strictly NOT selling
    res_check = await client.get(f"/api/v1/group-land/parcels/{p102_summary['id']}")
    updated_owners = {o["owner_name"]: o for o in res_check.json()["co_owners"]}
    assert updated_owners["Rahul Sharma"]["share_status"] == "Not Selling"
    assert updated_owners["Priya Desai"]["share_status"] == "Not Selling"
    assert updated_owners["Amit Patel"]["share_status"] == "Share For Sale"

    # 7. Complete sale to Buyer "Vikram Mehta"
    res_complete = await client.post(
        f"/api/v1/group-land/sell-requests/{sale_req_id}/complete-sale",
        json={
            "buyer_name": "Vikram Mehta",
            "buyer_email": "v.mehta@infra-invest.in",
            "final_price": 4500000,
        },
    )
    assert res_complete.status_code == 200

    # 8. Verify post-sale ownership structure:
    # Rahul -> 50%, Vikram Mehta -> 30%, Priya -> 20%
    res_post = await client.get(f"/api/v1/group-land/parcels/{p102_summary['id']}")
    final_owners = {o["owner_name"]: o["ownership_percentage"] for o in res_post.json()["co_owners"]}

    assert final_owners.get("Rahul Sharma") == 50.0
    assert final_owners.get("Vikram Mehta") == 30.0
    assert final_owners.get("Priya Desai") == 20.0
    # Total sum == 100.0
    assert round(sum(final_owners.values()), 2) == 100.0

    # 9. Verify audit trail logged
    res_audit = await client.get(f"/api/v1/group-land/parcels/{p102_summary['id']}/audit-trail")
    assert res_audit.status_code == 200
    logs = res_audit.json()
    assert len(logs) >= 2
    assert any(log["action"] == "SHARE_SALE_COMPLETED" for log in logs)
