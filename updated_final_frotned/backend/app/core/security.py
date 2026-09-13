import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt
from app.core.config import settings
from app.core.exceptions import AuthenticationException

# Production-grade Argon2id password hasher
_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MB
    parallelism=4,
    hash_len=32,
    salt_len=16,
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id hash."""
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, Exception):
        return False


def get_password_hash(password: str) -> str:
    """Generates an Argon2id hash for the given plain password."""
    return _ph.hash(password)


def create_access_token(
    subject: str,
    role: str,
    state_id: Optional[str] = None,
    district_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Creates a signed JWT access token embedding essential claims for RBAC and Geographic Scoping.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    claims: Dict[str, Any] = {
        "sub": subject,
        "role": role,
        "state_id": state_id,
        "district_id": district_id,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
    }
    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(claims, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token() -> str:
    """Creates a high-entropy cryptographically secure refresh token."""
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    """Computes SHA-256 digest of a token for safe database persistence."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT access token.
    Raises AuthenticationException if expired or invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": True, "verify_sub": True},
        )
        if payload.get("type") != "access":
            raise AuthenticationException("Invalid token type")
        return payload
    except JWTError as e:
        raise AuthenticationException(f"Token validation failed: {str(e)}")
