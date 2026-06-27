from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin
from app.database import get_db
from app.models import Branch
from app.schemas import BranchOut

router = APIRouter(prefix="/api", tags=["branches"])


@router.get("/branches", response_model=list[BranchOut])
async def list_branches(db: AsyncSession = Depends(get_db)) -> list[Branch]:
    result = await db.execute(select(Branch).order_by(Branch.id))
    return result.scalars().all()
