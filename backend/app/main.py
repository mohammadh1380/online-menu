from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import auth, categories, menu


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
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
    allow_origins=["*"],  # Tighten to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(menu.router)

# Serve uploaded photos at /media/<filename>
app.mount("/media", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="media")


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
