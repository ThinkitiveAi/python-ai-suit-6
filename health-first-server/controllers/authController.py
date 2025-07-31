from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
from services.authService import login_provider
from services.tokenService import refresh_token

router = APIRouter(
    prefix="/api/v1/provider",
    tags=["Provider Authentication"],
    responses={404: {"description": "Not found"}},
)

class ProviderLoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post('/login', summary="Provider Login", description="Authenticate provider with email and password")
async def login(request: Request, body: ProviderLoginRequest):
    result, code = await login_provider(request, body.dict())
    if not result['success']:
        raise HTTPException(status_code=code, detail=result)
    return result

@router.post('/refresh', summary="Refresh Token", description="Refresh access token using refresh token")
async def refresh(request: Request, body: RefreshTokenRequest):
    result, code = await refresh_token(request, body.dict())
    if not result['success']:
        raise HTTPException(status_code=code, detail=result)
    return result

@router.post('/logout', summary="Provider Logout", description="Logout provider and invalidate session")
async def logout_ep(request: Request, body: RefreshTokenRequest):
    return {"success": True, "message": "Logged out (stub)"} 