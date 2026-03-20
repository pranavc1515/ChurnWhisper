"""Account Pydantic models."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PrimaryContact(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class AccountCreate(BaseModel):
    account_name: str = Field(..., min_length=1)
    company_size: Optional[str] = None
    industry: Optional[str] = None
    plan_tier: Optional[str] = None
    monthly_revenue: Optional[float] = None
    contract_renewal_date: Optional[datetime] = None
    primary_contact: Optional[PrimaryContact] = None
    tags: list[str] = Field(default_factory=list)


class AccountUpdate(BaseModel):
    account_name: Optional[str] = Field(None, min_length=1)
    company_size: Optional[str] = None
    industry: Optional[str] = None
    plan_tier: Optional[str] = None
    monthly_revenue: Optional[float] = None
    contract_renewal_date: Optional[datetime] = None
    primary_contact: Optional[PrimaryContact] = None
    tags: Optional[list[str]] = None
    status: Optional[str] = None
