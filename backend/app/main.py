from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal, Base, engine
from app.models import Branch
from app.routers import auth, branches, categories, menu

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    await _seed_branches()
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

app.mount("/media", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="media")


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
