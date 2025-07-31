from fastapi import APIRouter, HTTPException, status, Request, Query, Path
from typing import Optional
from models.ProviderAvailability import (
    ProviderAvailabilityCreate,
    ProviderAvailabilityUpdate,
    AvailabilitySearchRequest
)
from services.providerAvailabilityService import (
    create_provider_availability,
    get_provider_availability_slots,
    update_availability_slot,
    delete_availability_slot,
    search_availability_slots
)

router = APIRouter(
    prefix="/api/v1/provider",
    tags=["Provider Availability Management"],
    responses={404: {"description": "Not found"}},
)

@router.post('/availability', status_code=201, summary="Create Availability Slots", description="Create provider availability slots with support for recurring patterns")
async def create_availability_endpoint(request: Request, availability: ProviderAvailabilityCreate):
    """
    Create provider availability slots
    Supports single and recurring availability patterns
    """
    result = await create_provider_availability(request, availability)
    
    if not result['success']:
        status_code = result.get('status_code', 400)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result

@router.get('/{provider_id}/availability', summary="Get Provider Availability", description="Get provider availability slots within a date range")
async def get_provider_availability_endpoint(
    provider_id: str,
    request: Request,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status (available/booked/cancelled/blocked)"),
    appointment_type: Optional[str] = Query(None, description="Filter by appointment type"),
    timezone: Optional[str] = Query(None, description="Timezone for display (defaults to provider's timezone)")
):
    """
    Get provider availability slots
    """
    # Validate required parameters
    if not start_date or not end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date and end_date are required"
        )
    
    try:
        from datetime import date
        start_date_obj = date.fromisoformat(start_date)
        end_date_obj = date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    result = await get_provider_availability_slots(
        provider_id=provider_id,
        start_date=start_date_obj,
        end_date=end_date_obj,
        status=status,
        appointment_type=appointment_type,
        timezone=timezone
    )
    
    if not result['success']:
        status_code = result.get('status_code', 500)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result

@router.put('/availability/{slot_id}', summary="Update Availability Slot", description="Update specific availability slot")
async def update_availability_slot_endpoint(
    slot_id: str,
    request: Request,
    updates: ProviderAvailabilityUpdate
):
    """
    Update specific availability slot
    """
    result = await update_availability_slot(slot_id, updates)
    
    if not result['success']:
        status_code = result.get('status_code', 400)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result

@router.delete('/availability/{slot_id}', summary="Delete Availability Slot", description="Delete availability slot with optional recurring deletion")
async def delete_availability_slot_endpoint(
    slot_id: str,
    request: Request,
    delete_recurring: bool = Query(False, description="Delete all recurring instances"),
    reason: Optional[str] = Query(None, description="Reason for deletion")
):
    """
    Delete availability slot
    """
    result = await delete_availability_slot(slot_id, delete_recurring, reason)
    
    if not result['success']:
        status_code = result.get('status_code', 400)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result

@router.get('/availability/search', summary="Search Available Slots", description="Search for available appointment slots based on various criteria")
async def search_availability_endpoint(
    request: Request,
    date: Optional[str] = Query(None, description="Specific date (YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Start date for range (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date for range (YYYY-MM-DD)"),
    specialization: Optional[str] = Query(None, description="Provider specialization"),
    location: Optional[str] = Query(None, description="Location (city, state, or zip)"),
    appointment_type: Optional[str] = Query(None, description="Appointment type"),
    insurance_accepted: Optional[bool] = Query(None, description="Filter by insurance acceptance"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    timezone: Optional[str] = Query(None, description="Timezone for display"),
    available_only: bool = Query(True, description="Show only available slots")
):
    """
    Search for available appointment slots
    """
    try:
        from datetime import date as date_type
        
        # Parse dates
        date_obj = None
        start_date_obj = None
        end_date_obj = None
        
        if date:
            date_obj = date_type.fromisoformat(date)
        if start_date:
            start_date_obj = date_type.fromisoformat(start_date)
        if end_date:
            end_date_obj = date_type.fromisoformat(end_date)
            
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Create search request
    search_request = AvailabilitySearchRequest(
        date=date_obj,
        start_date=start_date_obj,
        end_date=end_date_obj,
        specialization=specialization,
        location=location,
        appointment_type=appointment_type,
        insurance_accepted=insurance_accepted,
        max_price=max_price,
        timezone=timezone,
        available_only=available_only
    )
    
    result = await search_availability_slots(search_request)
    
    if not result['success']:
        status_code = result.get('status_code', 500)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result 