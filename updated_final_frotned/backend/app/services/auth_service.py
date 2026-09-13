from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import AccountLockedException, AuthenticationException
from app.core.logging import logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.users import RefreshToken, RoleEnum, User
from app.schemas.auth import LoginRequest, TokenResponse, UserSummary


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class AuthService:
    @staticmethod
    async def authenticate(db: AsyncSession, request: LoginRequest) -> TokenResponse:
        stmt = select(User).where(User.email == request.email.lower())
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise AuthenticationException("Invalid email or password.")

        # Account lockout check (brute-force defense)
        locked_until = ensure_utc(user.locked_until)
        if locked_until and locked_until > datetime.now(timezone.utc):
            remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60)
            raise AccountLockedException(
                f"Account temporarily locked due to repeated failed logins. Retry in {remaining + 1} minutes."
            )

        # Verify password
        if not verify_password(request.password, user.hashed_password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
                logger.warning(f"Account {user.email} locked out after 5 failed login attempts.")
            await db.commit()
            raise AuthenticationException("Invalid email or password.")

        # Successful login: reset failed attempts
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.now(timezone.utc)

        # Generate tokens
        access_token = create_access_token(
            subject=user.id,
            role=user.role.value,
            state_id=user.state_id,
            district_id=user.district_id,
        )
        plain_refresh_token = create_refresh_token()
        refresh_token_hash = hash_token(plain_refresh_token)

        # Store hashed refresh token
        db_refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=refresh_token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(db_refresh_token)
        await db.commit()

        logger.info(f"User {user.email} authenticated successfully with role {user.role.value}.")

        return TokenResponse(
            access_token=access_token,
            refresh_token=plain_refresh_token,
            token_type="bearer",
            expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserSummary(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                state_id=user.state_id,
                district_id=user.district_id,
                is_active=user.is_active,
            ),
        )

    @staticmethod
    async def refresh(db: AsyncSession, plain_refresh_token: str) -> TokenResponse:
        token_hash = hash_token(plain_refresh_token)
        stmt = (
            select(RefreshToken)
            .join(User)
            .where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,
            )
        )
        result = await db.execute(stmt)
        token_record = result.scalar_one_or_none()

        if not token_record:
            raise AuthenticationException("Invalid or revoked refresh token.")

        expires = ensure_utc(token_record.expires_at)
        if expires is None or expires < datetime.now(timezone.utc):
            token_record.is_revoked = True
            await db.commit()
            raise AuthenticationException("Refresh token has expired. Please login again.")

        # Token rotation: revoke old refresh token
        token_record.is_revoked = True

        # Fetch user
        user_stmt = select(User).where(User.id == token_record.user_id, User.is_active == True)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if not user:
            raise AuthenticationException("User account not active.")

        # Issue new token pair
        new_access_token = create_access_token(
            subject=user.id,
            role=user.role.value,
            state_id=user.state_id,
            district_id=user.district_id,
        )
        new_plain_refresh = create_refresh_token()
        new_refresh_record = RefreshToken(
            user_id=user.id,
            token_hash=hash_token(new_plain_refresh),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        db.add(new_refresh_record)
        await db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_plain_refresh,
            token_type="bearer",
            expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserSummary(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                state_id=user.state_id,
                district_id=user.district_id,
                is_active=user.is_active,
            ),
        )

    @staticmethod
    async def logout(db: AsyncSession, plain_refresh_token: str) -> None:
        token_hash = hash_token(plain_refresh_token)
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(is_revoked=True)
        )
        await db.execute(stmt)
        await db.commit()
