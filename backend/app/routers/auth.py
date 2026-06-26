import secrets

from fastapi import APIRouter, HTTPException, status

from app.auth import create_access_token
from app.config import settings
from app.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/admin", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest) -> TokenResponse:
    username_ok = secrets.compare_digest(data.username, settings.ADMIN_USERNAME)
    password_ok = secrets.compare_digest(data.password, settings.ADMIN_PASSWORD)
    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور اشتباه است",
        )
    token = create_access_token(subject=data.username)
    return TokenResponse(access_token=token)
