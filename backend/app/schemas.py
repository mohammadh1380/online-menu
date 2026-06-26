from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


# ── Category ─────────────────────────────────────────────────────────────────

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

    model_config = {"from_attributes": True}


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
