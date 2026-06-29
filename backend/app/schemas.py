from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


# ── Branch ────────────────────────────────────────────────────────────────────

class BranchOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


# ── Category ──────────────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str
    slug: str
    order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int

    model_config = {"from_attributes": True}


# ── MenuItem ──────────────────────────────────────────────────────────────────

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    is_available: bool = True
    order: int = 0
    category_id: int

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v


class MenuItemOut(MenuItemBase):
    id: int
    photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None
    branches: list[BranchOut] = []

    model_config = {"from_attributes": True}


# ── Settings ──────────────────────────────────────────────────────────────────

class SettingsOut(BaseModel):
    cafe_name: str
    subtitle:  str
    instagram: str

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    cafe_name: Optional[str] = None
    subtitle:  Optional[str] = None
    instagram: Optional[str] = None


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
