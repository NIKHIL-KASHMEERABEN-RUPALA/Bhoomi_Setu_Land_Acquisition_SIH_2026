import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


from app.db.session import get_engine


@pytest_asyncio.fixture(scope="session")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    engine = get_engine()
    await engine.dispose()


@pytest.fixture
def central_admin_token() -> str:
    return create_access_token(
        subject="u-admin-01",
        role="central_admin",
        state_id="s-gj",
        district_id=None,
    )


@pytest.fixture
def district_officer_token() -> str:
    # Officer scoped to Ahmedabad (d-04)
    return create_access_token(
        subject="u-ahmedabad-01",
        role="district_officer",
        state_id="s-gj",
        district_id="d-04",
    )


@pytest.fixture
def viewer_token() -> str:
    return create_access_token(
        subject="u-viewer-01",
        role="viewer",
        state_id="s-gj",
        district_id=None,
    )
