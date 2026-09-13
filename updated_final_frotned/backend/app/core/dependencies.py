from typing import Any, Callable, List, Optional
from fastapi import Depends, Header, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationException, AuthorizationDeniedException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.users import RoleEnum, User

# Standard HTTP Bearer scheme
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validates JWT Bearer token and returns the authenticated User entity.
    Raises 401 if missing, expired, or invalid.
    """
    if not credentials or credentials.scheme.lower() != "bearer":
        raise AuthenticationException("Authorization header with Bearer token is required.")

    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise AuthenticationException("Invalid token: subject missing.")

    stmt = select(User).where(User.id == user_id, User.is_active == True)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise AuthenticationException("User account not found or deactivated.")

    return user


def require_roles(*allowed_roles: RoleEnum) -> Callable[..., Any]:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Verifies that the authenticated user possesses one of the allowed roles.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise AuthorizationDeniedException(
                f"Role '{current_user.role.value}' is not authorized to perform this operation. "
                f"Required: {[r.value for r in allowed_roles]}"
            )
        return current_user

    return role_checker


def verify_geographic_scope(
    user: User,
    state_id: Optional[str] = None,
    district_id: Optional[str] = None,
) -> None:
    """
    Fine-Grained Geographic / Object-Level Authorization.
    Enforces that:
    - central_admin: Full access to all states/districts.
    - state_admin: Restricted exclusively to their assigned state_id.
    - district_officer: Restricted exclusively to their assigned district_id.
    Prevents BOLA/IDOR and cross-jurisdictional privilege escalation.
    """
    if user.role == RoleEnum.CENTRAL_ADMIN:
        return  # Full jurisdictional clearance

    if user.role == RoleEnum.STATE_ADMIN:
        if state_id and user.state_id and state_id != user.state_id:
            raise AuthorizationDeniedException(
                f"State Admin jurisdiction violation: cannot access state '{state_id}'."
            )
        return

    if user.role == RoleEnum.DISTRICT_OFFICER:
        if district_id and user.district_id and district_id != user.district_id:
            raise AuthorizationDeniedException(
                f"District Officer jurisdiction violation: cannot access district '{district_id}'."
            )
        return

    # Analysts & Viewers can read within their assigned scope if configured
    if user.district_id and district_id and user.district_id != district_id:
        raise AuthorizationDeniedException("Jurisdiction restriction: outside assigned district.")
    if user.state_id and state_id and user.state_id != state_id:
        raise AuthorizationDeniedException("Jurisdiction restriction: outside assigned state.")
