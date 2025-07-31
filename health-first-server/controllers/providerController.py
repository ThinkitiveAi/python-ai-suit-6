from fastapi import APIRouter, HTTPException, status, Request
from models.Provider import ProviderCreate
from services.providerService import register_provider

router = APIRouter(
    prefix="/api/v1/provider",
    tags=["Provider Management"],
    responses={404: {"description": "Not found"}},
)

@router.post('/register', status_code=201, summary="Register Provider", description="Register a new healthcare provider with comprehensive validation")
async def register_provider_endpoint(request: Request, provider: ProviderCreate):
    result = await register_provider(request, provider)
    if not result['success']:
        raise HTTPException(status_code=result.get('status_code', 400), detail=result)
    return result 