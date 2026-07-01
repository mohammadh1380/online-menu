from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Table, Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# ── Many-to-many: MenuItem <-> Branch ────────────────────────────────────────

menu_item_branches = Table(
    "menu_item_branches",
    Base.metadata,
    Column("menu_item_id", ForeignKey("menu_items.id", ondelete="CASCADE"), primary_key=True),
    Column("branch_id",    ForeignKey("branches.id",    ondelete="CASCADE"), primary_key=True),
)


# ── Branch ────────────────────────────────────────────────────────────────────

class Branch(Base):
    __tablename__ = "branches"

    id:   Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    items: Mapped[list["MenuItem"]] = relationship(
        "MenuItem", secondary=menu_item_branches, back_populates="branches"
    )


# ── Category ──────────────────────────────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"

    id:    Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name:  Mapped[str] = mapped_column(String(100), nullable=False)
    slug:  Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    items: Mapped[list["MenuItem"]] = relationship(
        "MenuItem", back_populates="category", cascade="all, delete-orphan"
    )


# ── MenuItem ──────────────────────────────────────────────────────────────────

class MenuItem(Base):
    __tablename__ = "menu_items"

    id:           Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    name:         Mapped[str]           = mapped_column(String(200), nullable=False)
    description:  Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price:        Mapped[float]         = mapped_column(Float, nullable=False)
    photo:        Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_available: Mapped[bool]          = mapped_column(Boolean, default=True, nullable=False)
    is_featured:  Mapped[bool]          = mapped_column(Boolean, default=False, nullable=False)
    order:        Mapped[int]           = mapped_column(Integer, default=0, nullable=False)
    category_id:  Mapped[int]           = mapped_column(ForeignKey("categories.id"), nullable=False)
    created_at:   Mapped[datetime]      = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at:   Mapped[datetime]      = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    category: Mapped["Category"]     = relationship("Category", back_populates="items")
    branches: Mapped[list["Branch"]] = relationship(
        "Branch", secondary=menu_item_branches, back_populates="items"
    )


# ── Settings (singleton row, id=1) ───────────────────────────────────────────

class Settings(Base):
    __tablename__ = "settings"

    id:         Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    cafe_name:  Mapped[str] = mapped_column(String(200), nullable=False, default="کافه ما")
    subtitle:   Mapped[str] = mapped_column(String(300), nullable=False, default="لذت یک فنجان خوب، با هر سفارش")
    instagram:  Mapped[str] = mapped_column(String(200), nullable=False, default="")
