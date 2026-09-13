from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.auth import LoginRequest, RefreshTokenRequest, TokenResponse, UserSummary
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


@router.post("/login", response_model=TokenResponse, summary="User authentication with Argon2id and JWT")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticates government officers with email and password.
    Returns short-lived access JWT and single-use rotating refresh token.
    Throttled to protect against brute-force attacks.
    """
    return await AuthService.authenticate(db, body)


@router.post("/refresh", response_model=TokenResponse, summary="Rotate refresh token and issue new access token")
async def refresh_tokens(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Validates the refresh token, revokes it (token rotation), and issues
    a fresh access/refresh token pair.
    """
    return await AuthService.refresh(db, body.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Revoke refresh token and terminate session")
async def logout(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Revokes the provided refresh token, preventing further token refresh.
    """
    await AuthService.logout(db, body.refresh_token)
    return None


@router.get("/me", response_model=UserSummary, summary="Retrieve current authenticated officer profile")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns current officer identity, role permissions, and geographic scope clearance.
    """
    return UserSummary(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        state_id=current_user.state_id,
        district_id=current_user.district_id,
        is_active=current_user.is_active,
    )
