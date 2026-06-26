from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin
from app.database import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryOut

router = APIRouter(prefix="/api", tags=["categories"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.order, Category.name))
    return result.scalars().all()


@router.post(
    "/admin/categories",
    response_model=CategoryOut,
    dependencies=[Depends(get_current_admin)],
)
async def create_category(
    data: CategoryCreate, db: AsyncSession = Depends(get_db)
) -> Category:
    # Enforce slug uniqueness with a clear error
    existing = await db.execute(select(Category).where(Category.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="این شناسه قبلاً استفاده شده است")

    category = Category(**data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.delete(
    "/admin/categories/{category_id}",
    dependencies=[Depends(get_current_admin)],
)
async def delete_category(
    category_id: int, db: AsyncSession = Depends(get_db)
) -> dict:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="دسته‌بندی یافت نشد")
    await db.delete(category)
    await db.commit()
    return {"ok": True}
