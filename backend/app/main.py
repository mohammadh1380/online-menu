from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, text

from app.config import settings
from app.database import AsyncSessionLocal, Base, engine
from app.models import Branch, Settings
from app.routers import auth, branches, categories, menu, settings as settings_router

_DEFAULT_BRANCHES = [
    {"name": "شعبه نصر",     "slug": "nasr"},
    {"name": "شعبه ولیعصر", "slug": "valiasr"},
]


async def _seed_branches() -> None:
    async with AsyncSessionLocal() as db:
        for data in _DEFAULT_BRANCHES:
            exists = await db.execute(select(Branch).where(Branch.slug == data["slug"]))
            if not exists.scalar_one_or_none():
                db.add(Branch(**data))
        await db.commit()


async def _seed_settings() -> None:
    async with AsyncSessionLocal() as db:
        exists = await db.execute(select(Settings).where(Settings.id == 1))
        if not exists.scalar_one_or_none():
            db.add(Settings(id=1, cafe_name="کافه ما", instagram=""))
            await db.commit()


async def _run_migrations() -> None:
    """Add columns that were introduced after the initial schema creation."""
    async with engine.begin() as conn:
        await conn.execute(text("""
            ALTER TABLE settings
            ADD COLUMN IF NOT EXISTS subtitle VARCHAR(300)
                NOT NULL DEFAULT 'لذت یک فنجان خوب، با هر سفارش'
        """))


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _run_migrations()
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    await _seed_branches()
    await _seed_settings()
    yield
    await engine.dispose()


app = FastAPI(
    title="Coffee Menu API",
    description="Backend for the Persian online coffee menu",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(branches.router)
app.include_router(categories.router)
app.include_router(menu.router)
app.include_router(settings_router.router)

app.mount("/media", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="media")


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
