import uuid
from pathlib import Path
from typing import Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_admin
from app.config import settings
from app.database import get_db
from app.models import Branch, MenuItem
from app.schemas import MenuItemOut

router = APIRouter(prefix="/api", tags=["menu"])

_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


async def _save_upload(file: UploadFile) -> str:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="فقط فرمت‌های JPG، PNG و WebP مجاز هستند")

    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(status_code=400, detail=f"حجم فایل نباید بیشتر از {settings.MAX_FILE_SIZE_MB}MB باشد")

    filename = f"{uuid.uuid4()}{suffix}"
    dest = settings.UPLOAD_DIR / filename
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)
    return filename


def _delete_photo(filename: Optional[str]) -> None:
    if filename:
        path = settings.UPLOAD_DIR / filename
        if path.exists():
            path.unlink(missing_ok=True)


async def _load_item(db: AsyncSession, item_id: int) -> MenuItem:
    result = await db.execute(
        select(MenuItem)
        .options(selectinload(MenuItem.category), selectinload(MenuItem.branches))
        .where(MenuItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="آیتم یافت نشد")
    return item


async def _resolve_branches(db: AsyncSession, branch_ids: list[int]) -> list[Branch]:
    if not branch_ids:
        return []
    result = await db.execute(select(Branch).where(Branch.id.in_(branch_ids)))
    return result.scalars().all()


# ── Public endpoints ──────────────────────────────────────────────────────────

@router.get("/menu", response_model=list[MenuItemOut])
async def get_menu(
    branch_id: Optional[int] = None,
    category_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
) -> list[MenuItem]:
    query = (
        select(MenuItem)
        .options(selectinload(MenuItem.category), selectinload(MenuItem.branches))
        .where(MenuItem.is_available == True)  # noqa: E712
        .order_by(MenuItem.order, MenuItem.id)
    )
    if branch_id:
        query = query.where(MenuItem.branches.any(Branch.id == branch_id))
    if category_id:
        query = query.where(MenuItem.category_id == category_id)
    result = await db.execute(query)
    return result.scalars().all()


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get(
    "/admin/menu",
    response_model=list[MenuItemOut],
    dependencies=[Depends(get_current_admin)],
)
async def admin_get_menu(db: AsyncSession = Depends(get_db)) -> list[MenuItem]:
    result = await db.execute(
        select(MenuItem)
        .options(selectinload(MenuItem.category), selectinload(MenuItem.branches))
        .order_by(MenuItem.order, MenuItem.id)
    )
    return result.scalars().all()


@router.post(
    "/admin/menu",
    response_model=MenuItemOut,
    dependencies=[Depends(get_current_admin)],
)
async def create_item(
    name: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    description: Optional[str] = Form(None),
    is_available: bool = Form(True),
    order: int = Form(0),
    branch_ids: list[int] = Form(default=[]),
    photo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
) -> MenuItem:
    photo_filename: Optional[str] = None
    if photo and photo.filename:
        photo_filename = await _save_upload(photo)

    item = MenuItem(
        name=name,
        description=description,
        price=price,
        category_id=category_id,
        is_available=is_available,
        order=order,
        photo=photo_filename,
    )
    item.branches = await _resolve_branches(db, branch_ids)
    db.add(item)
    await db.commit()
    return await _load_item(db, item.id)


@router.put(
    "/admin/menu/{item_id}",
    response_model=MenuItemOut,
    dependencies=[Depends(get_current_admin)],
)
async def update_item(
    item_id: int,
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    category_id: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    is_available: Optional[bool] = Form(None),
    order: Optional[int] = Form(None),
    branch_ids: Optional[list[int]] = Form(default=None),
    photo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
) -> MenuItem:
    item = await _load_item(db, item_id)

    if name is not None:
        item.name = name
    if description is not None:
        item.description = description
    if price is not None:
        item.price = price
    if category_id is not None:
        item.category_id = category_id
    if is_available is not None:
        item.is_available = is_available
    if order is not None:
        item.order = order
    if branch_ids is not None:
        item.branches = await _resolve_branches(db, branch_ids)
    if photo and photo.filename:
        _delete_photo(item.photo)
        item.photo = await _save_upload(photo)

    await db.commit()
    return await _load_item(db, item_id)


@router.delete(
    "/admin/menu/{item_id}",
    dependencies=[Depends(get_current_admin)],
)
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    item = await _load_item(db, item_id)
    _delete_photo(item.photo)
    await db.delete(item)
    await db.commit()
    return {"ok": True}
