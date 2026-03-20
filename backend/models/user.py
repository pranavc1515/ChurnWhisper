"""User Pydantic models."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """User registration input."""

    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """User login input."""

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """User profile update input."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    company_name: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = Field(None, max_length=100)


class UserResponse(BaseModel):
    """User response (no sensitive data)."""

    id: str
    name: str
    email: str
    company_name: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class ForgotPasswordRequest(BaseModel):
    """Forgot password input."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password input."""

    token: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    """Change password input (authenticated)."""

    current_password: str
    new_password: str = Field(..., min_length=8)
