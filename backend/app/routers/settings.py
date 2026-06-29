from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin
from app.database import get_db
from app.models import Settings
from app.schemas import SettingsOut, SettingsUpdate

router = APIRouter(tags=["settings"])


async def _get_or_create(db: AsyncSession) -> Settings:
    result = await db.execute(select(Settings).where(Settings.id == 1))
    row = result.scalar_one_or_none()
    if row is None:
        row = Settings(id=1, cafe_name="کافه ما", subtitle="لذت یک فنجان خوب، با هر سفارش", instagram="")
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


@router.get("/api/settings", response_model=SettingsOut)
async def get_settings(db: AsyncSession = Depends(get_db)) -> Settings:
    return await _get_or_create(db)


@router.put("/api/admin/settings", response_model=SettingsOut, dependencies=[Depends(get_current_admin)])
async def update_settings(
    data: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
) -> Settings:
    row = await _get_or_create(db)
    if data.cafe_name is not None:
        row.cafe_name = data.cafe_name.strip()
    if data.subtitle is not None:
        row.subtitle = data.subtitle.strip()
    if data.instagram is not None:
        row.instagram = data.instagram.strip().lstrip("@")
    await db.commit()
    await db.refresh(row)
    return row
