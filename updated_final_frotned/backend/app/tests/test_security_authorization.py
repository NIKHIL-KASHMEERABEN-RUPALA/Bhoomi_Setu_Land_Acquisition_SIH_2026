import pytest
from httpx import AsyncClient
from sqlalchemy import update
from app.db.session import get_sessionmaker
from app.models.users import User


@pytest.mark.asyncio
async def test_geographic_scope_access_control(client: AsyncClient, district_officer_token: str):
    """
    District Officer for Ahmedabad (d-04) accessing p-001 (Ahmedabad)
    should SUCCEED.
    Accessing p-004 (Kutch, d-01) must be REJECTED with 403 Forbidden.
    """
    # Allowed: p-001 is in Ahmedabad
    res_allowed = await client.get(
        "/api/v1/projects/p-001",
        headers={"Authorization": f"Bearer {district_officer_token}"},
    )
    assert res_allowed.status_code == 200

    # Forbidden: p-004 is in Kutch, district officer cannot access another district
    res_forbidden = await client.get(
        "/api/v1/projects/p-004",
        headers={"Authorization": f"Bearer {district_officer_token}"},
    )
    assert res_forbidden.status_code == 403
    err_msg = res_forbidden.json()["error"]["message"].lower()
    assert "jurisdiction" in err_msg


@pytest.mark.asyncio
async def test_unauthenticated_request_rejected(client: AsyncClient):
    """
    Accessing protected endpoints without token must return 401 Unauthorized.
    """
    response = await client.get("/api/v1/projects")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_brute_force_lockout(client: AsyncClient):
    """
    Simulating 5 consecutive failed login attempts on an account
    must trigger an account lockout.
    """
    test_email = "viewer@bhoomi.gov.in"

    # Reset any existing lockout state for test idempotency
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as db:
        await db.execute(
            update(User)
            .where(User.email == test_email)
            .values(failed_login_attempts=0, locked_until=None)
        )
        await db.commit()

    for i in range(5):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": test_email, "password": "WrongPassword123!"},
        )
        assert resp.status_code == 401

    # The 6th attempt should be blocked with 423 Locked
    resp_locked = await client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": "WrongPassword123!"},
    )
    assert resp_locked.status_code == 423
    err_msg = resp_locked.json()["error"]["message"].lower()
    assert "locked" in err_msg

    # Cleanup: restore user active state
    async with sessionmaker() as db:
        await db.execute(
            update(User)
            .where(User.email == test_email)
            .values(failed_login_attempts=0, locked_until=None)
        )
        await db.commit()
