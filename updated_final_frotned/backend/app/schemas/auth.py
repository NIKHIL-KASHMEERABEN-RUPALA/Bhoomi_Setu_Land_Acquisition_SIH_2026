from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.users import RoleEnum


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: RoleEnum
    state_id: str | None = None
    district_id: str | None = None
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserSummary


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: RoleEnum = RoleEnum.VIEWER
    state_id: str | None = None
    district_id: str | None = None
