from models.ProviderAvailability import (
    ProviderAvailabilityCreate, 
    ProviderAvailabilityUpdate, 
    ProviderAvailabilityDB, 
    AppointmentSlot,
    AvailabilitySearchRequest,
    AvailabilityStatus,
    AppointmentType
)
from models.provider_availability_store import (
    add_provider_availability,
    get_provider_availability,
    update_provider_availability,
    delete_provider_availability,
    add_appointment_slot,
    get_appointment_slots,
    update_appointment_slot,
    delete_appointment_slot
)
from datetime import date, datetime, time, timedelta
from typing import List, Dict, Any, Optional, Tuple
import pytz
import logging
import uuid
from dateutil import rrule

# Configure logging
logger = logging.getLogger(__name__)

def convert_to_utc(local_time: str, date_obj: date, timezone_str: str) -> datetime:
    """
    Convert local time to UTC
    Args:
        local_time: Time in HH:mm format
        date_obj: Date object
        timezone_str: Timezone string (e.g., "America/New_York")
    Returns:
        datetime: UTC datetime
    """
    try:
        # Create timezone object
        tz = pytz.timezone(timezone_str)
        
        # Parse time
        hour, minute = map(int, local_time.split(':'))
        local_datetime = datetime.combine(date_obj, time(hour, minute))
        
        # Localize and convert to UTC
        local_dt = tz.localize(local_datetime)
        utc_dt = local_dt.astimezone(pytz.UTC)
        
        return utc_dt
    except Exception as e:
        logger.error(f"Error converting to UTC: {str(e)}")
        raise ValueError(f"Invalid timezone or time format: {timezone_str}")

def convert_from_utc(utc_datetime: datetime, timezone_str: str) -> str:
    """
    Convert UTC datetime to local time string
    Args:
        utc_datetime: UTC datetime
        timezone_str: Target timezone string
    Returns:
        str: Time in HH:mm format
    """
    try:
        tz = pytz.timezone(timezone_str)
        local_dt = utc_datetime.astimezone(tz)
        return local_dt.strftime("%H:%M")
    except Exception as e:
        logger.error(f"Error converting from UTC: {str(e)}")
        raise ValueError(f"Invalid timezone: {timezone_str}")

def generate_slots_from_availability(availability: ProviderAvailabilityDB) -> List[AppointmentSlot]:
    """
    Generate appointment slots from availability
    Args:
        availability: Provider availability object
    Returns:
        List[AppointmentSlot]: Generated appointment slots
    """
    slots = []
    
    # Convert start and end times to datetime objects
    start_dt = convert_to_utc(availability.start_time, availability.date, availability.timezone)
    end_dt = convert_to_utc(availability.end_time, availability.date, availability.timezone)
    
    # Generate slots
    current_time = start_dt
    slot_number = 0
    
    while current_time < end_dt:
        slot_end_time = current_time + timedelta(minutes=availability.slot_duration)
        
        # Skip if slot would exceed end time
        if slot_end_time > end_dt:
            break
        
        # Create appointment slot
        slot = AppointmentSlot(
            availability_id=availability.id,
            provider_id=availability.provider_id,
            slot_start_time=current_time,
            slot_end_time=slot_end_time,
            status=AvailabilityStatus.AVAILABLE,
            appointment_type=availability.appointment_type.value
        )
        
        slots.append(slot)
        
        # Move to next slot (including break)
        current_time = slot_end_time + timedelta(minutes=availability.break_duration)
        slot_number += 1
    
    return slots

def generate_recurring_slots(availability: ProviderAvailabilityCreate) -> List[Tuple[ProviderAvailabilityDB, List[AppointmentSlot]]]:
    """
    Generate recurring availability slots
    Args:
        availability: Provider availability creation object
    Returns:
        List[Tuple[ProviderAvailabilityDB, List[AppointmentSlot]]]: Availability and slots pairs
    """
    if not availability.is_recurring or not availability.recurrence_pattern or not availability.recurrence_end_date:
        return []
    
    results = []
    
    # Determine frequency based on recurrence pattern
    if availability.recurrence_pattern.value == "daily":
        freq = rrule.DAILY
    elif availability.recurrence_pattern.value == "weekly":
        freq = rrule.WEEKLY
    elif availability.recurrence_pattern.value == "monthly":
        freq = rrule.MONTHLY
    else:
        raise ValueError(f"Invalid recurrence pattern: {availability.recurrence_pattern}")
    
    # Generate dates
    dates = list(rrule.rrule(
        freq,
        dtstart=availability.date,
        until=availability.recurrence_end_date
    ))
    
    # Create availability for each date
    for date_obj in dates:
        # Create availability object
        availability_db = ProviderAvailabilityDB(
            provider_id=availability.provider_id,
            date=date_obj.date(),
            start_time=availability.start_time,
            end_time=availability.end_time,
            timezone=availability.timezone,
            is_recurring=availability.is_recurring,
            recurrence_pattern=availability.recurrence_pattern,
            recurrence_end_date=availability.recurrence_end_date,
            slot_duration=availability.slot_duration,
            break_duration=availability.break_duration,
            status=availability.status,
            max_appointments_per_slot=availability.max_appointments_per_slot,
            appointment_type=availability.appointment_type,
            location=availability.location,
            pricing=availability.pricing,
            notes=availability.notes,
            special_requirements=availability.special_requirements or []
        )
        
        # Generate slots for this availability
        slots = generate_slots_from_availability(availability_db)
        
        results.append((availability_db, slots))
    
    return results

def check_slot_conflicts(provider_id: str, start_time: datetime, end_time: datetime, exclude_slot_id: str = None) -> bool:
    """
    Check for slot conflicts for a provider
    Args:
        provider_id: Provider ID
        start_time: Start time (UTC)
        end_time: End time (UTC)
        exclude_slot_id: Slot ID to exclude from conflict check
    Returns:
        bool: True if conflict exists, False otherwise
    """
    existing_slots = get_appointment_slots(provider_id=provider_id)
    
    for slot in existing_slots:
        if exclude_slot_id and slot["id"] == exclude_slot_id:
            continue
            
        slot_start = slot["slot_start_time"]
        slot_end = slot["slot_end_time"]
        
        # Check for overlap
        if isinstance(slot_start, str):
            slot_start = datetime.fromisoformat(slot_start.replace('Z', '+00:00'))
        if isinstance(slot_end, str):
            slot_end = datetime.fromisoformat(slot_end.replace('Z', '+00:00'))
        
        if (start_time < slot_end and end_time > slot_start):
            return True
    
    return False

async def create_provider_availability(request, availability: ProviderAvailabilityCreate) -> Dict[str, Any]:
    """
    Create provider availability slots
    Args:
        request: FastAPI request object
        availability: Provider availability creation object
    Returns:
        Dict: Creation result
    """
    try:
        # Validate time range
        if availability.start_time >= availability.end_time:
            return {
                "success": False,
                "message": "End time must be after start time",
                "status_code": 400
            }
        
        # Check for conflicts if not recurring
        if not availability.is_recurring:
            start_dt = convert_to_utc(availability.start_time, availability.date, availability.timezone)
            end_dt = convert_to_utc(availability.end_time, availability.date, availability.timezone)
            
            if check_slot_conflicts(availability.provider_id, start_dt, end_dt):
                return {
                    "success": False,
                    "message": "Time slot conflicts with existing availability",
                    "status_code": 409
                }
        
        slots_created = 0
        total_appointments = 0
        
        if availability.is_recurring:
            # Generate recurring slots
            recurring_results = generate_recurring_slots(availability)
            
            for availability_db, slots in recurring_results:
                # Store availability
                add_provider_availability(availability_db)
                
                # Store slots
                for slot in slots:
                    add_appointment_slot(slot)
                    slots_created += 1
                    total_appointments += availability_db.max_appointments_per_slot
            
            # Calculate date range
            date_range = {
                "start": availability.date.isoformat(),
                "end": availability.recurrence_end_date.isoformat()
            }
            
        else:
            # Create single availability
            availability_db = ProviderAvailabilityDB(
                provider_id=availability.provider_id,
                date=availability.date,
                start_time=availability.start_time,
                end_time=availability.end_time,
                timezone=availability.timezone,
                is_recurring=availability.is_recurring,
                recurrence_pattern=availability.recurrence_pattern,
                recurrence_end_date=availability.recurrence_end_date,
                slot_duration=availability.slot_duration,
                break_duration=availability.break_duration,
                status=availability.status,
                max_appointments_per_slot=availability.max_appointments_per_slot,
                appointment_type=availability.appointment_type,
                location=availability.location,
                pricing=availability.pricing,
                notes=availability.notes,
                special_requirements=availability.special_requirements or []
            )
            
            # Store availability
            availability_id = add_provider_availability(availability_db)
            
            # Generate and store slots
            slots = generate_slots_from_availability(availability_db)
            for slot in slots:
                add_appointment_slot(slot)
                slots_created += 1
                total_appointments += availability_db.max_appointments_per_slot
            
            date_range = {
                "start": availability.date.isoformat(),
                "end": availability.date.isoformat()
            }
        
        logger.info(f"Provider availability created successfully. Provider: {availability.provider_id}, Slots: {slots_created}")
        
        return {
            "success": True,
            "message": "Availability slots created successfully",
            "data": {
                "availability_id": availability_db.id if not availability.is_recurring else "multiple",
                "slots_created": slots_created,
                "date_range": date_range,
                "total_appointments_available": total_appointments
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating provider availability: {str(e)}")
        return {
            "success": False,
            "message": "Failed to create availability slots",
            "status_code": 500
        }

async def get_provider_availability_slots(
    provider_id: str,
    start_date: date,
    end_date: date,
    status: Optional[str] = None,
    appointment_type: Optional[str] = None,
    timezone: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get provider availability slots
    Args:
        provider_id: Provider ID
        start_date: Start date
        end_date: End date
        status: Filter by status
        appointment_type: Filter by appointment type
        timezone: Timezone for display
    Returns:
        Dict: Availability data
    """
    try:
        # Get availability records
        availability_records = get_provider_availability(provider_id=provider_id)
        
        # Filter by date range
        filtered_availability = [
            av for av in availability_records
            if start_date <= av["date"] <= end_date
        ]
        
        # Get all slots for this provider
        all_slots = get_appointment_slots(provider_id=provider_id)
        
        # Filter slots by date range and criteria
        filtered_slots = []
        for slot in all_slots:
            slot_date = slot["slot_start_time"].date() if isinstance(slot["slot_start_time"], datetime) else datetime.fromisoformat(slot["slot_start_time"].replace('Z', '+00:00')).date()
            
            if start_date <= slot_date <= end_date:
                if status and slot["status"] != status:
                    continue
                if appointment_type and slot["appointment_type"] != appointment_type:
                    continue
                filtered_slots.append(slot)
        
        # Group slots by date
        availability_by_date = {}
        for slot in filtered_slots:
            slot_date = slot["slot_start_time"].date() if isinstance(slot["slot_start_time"], datetime) else datetime.fromisoformat(slot["slot_start_time"].replace('Z', '+00:00')).date()
            
            if slot_date not in availability_by_date:
                availability_by_date[slot_date] = []
            
            # Convert times to local timezone for display
            display_timezone = timezone or "America/New_York"
            start_time = convert_from_utc(slot["slot_start_time"], display_timezone)
            end_time = convert_from_utc(slot["slot_end_time"], display_timezone)
            
            slot_info = {
                "slot_id": slot["id"],
                "start_time": start_time,
                "end_time": end_time,
                "status": slot["status"],
                "appointment_type": slot["appointment_type"],
                "location": slot.get("location"),
                "pricing": slot.get("pricing")
            }
            
            availability_by_date[slot_date].append(slot_info)
        
        # Calculate summary
        total_slots = len(filtered_slots)
        available_slots = len([s for s in filtered_slots if s["status"] == "available"])
        booked_slots = len([s for s in filtered_slots if s["status"] == "booked"])
        cancelled_slots = len([s for s in filtered_slots if s["status"] == "cancelled"])
        
        # Format response
        availability_list = []
        for date_obj in sorted(availability_by_date.keys()):
            availability_list.append({
                "date": date_obj.isoformat(),
                "slots": availability_by_date[date_obj]
            })
        
        return {
            "success": True,
            "data": {
                "provider_id": provider_id,
                "availability_summary": {
                    "total_slots": total_slots,
                    "available_slots": available_slots,
                    "booked_slots": booked_slots,
                    "cancelled_slots": cancelled_slots
                },
                "availability": availability_list
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting provider availability: {str(e)}")
        return {
            "success": False,
            "message": "Failed to retrieve availability",
            "status_code": 500
        }

async def update_availability_slot(slot_id: str, updates: ProviderAvailabilityUpdate) -> Dict[str, Any]:
    """
    Update specific availability slot
    Args:
        slot_id: Slot ID to update
        updates: Update data
    Returns:
        Dict: Update result
    """
    try:
        # Get existing slot
        existing_slots = get_appointment_slots(slot_id=slot_id)
        if not existing_slots:
            return {
                "success": False,
                "message": "Slot not found",
                "status_code": 404
            }
        
        slot = existing_slots[0]
        
        # Check for conflicts if time is being updated
        if updates.start_time or updates.end_time:
            # Get provider and availability info
            provider_id = slot["provider_id"]
            
            # Calculate new times
            new_start_time = updates.start_time or convert_from_utc(slot["slot_start_time"], "UTC")
            new_end_time = updates.end_time or convert_from_utc(slot["slot_end_time"], "UTC")
            
            # Convert to UTC for conflict check
            slot_date = slot["slot_start_time"].date() if isinstance(slot["slot_start_time"], datetime) else datetime.fromisoformat(slot["slot_start_time"].replace('Z', '+00:00')).date()
            new_start_dt = convert_to_utc(new_start_time, slot_date, "UTC")
            new_end_dt = convert_to_utc(new_end_time, slot_date, "UTC")
            
            if check_slot_conflicts(provider_id, new_start_dt, new_end_dt, slot_id):
                return {
                    "success": False,
                    "message": "Updated time conflicts with existing availability",
                    "status_code": 409
                }
        
        # Prepare update data
        update_data = {}
        if updates.start_time:
            update_data["start_time"] = updates.start_time
        if updates.end_time:
            update_data["end_time"] = updates.end_time
        if updates.status:
            update_data["status"] = updates.status.value
        if updates.notes:
            update_data["notes"] = updates.notes
        if updates.pricing:
            update_data["pricing"] = updates.pricing.dict()
        if updates.special_requirements:
            update_data["special_requirements"] = updates.special_requirements
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update slot
        success = update_appointment_slot(slot_id, update_data)
        
        if not success:
            return {
                "success": False,
                "message": "Failed to update slot",
                "status_code": 500
            }
        
        logger.info(f"Availability slot updated successfully. Slot ID: {slot_id}")
        
        return {
            "success": True,
            "message": "Slot updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error updating availability slot: {str(e)}")
        return {
            "success": False,
            "message": "Failed to update slot",
            "status_code": 500
        }

async def delete_availability_slot(slot_id: str, delete_recurring: bool = False, reason: str = None) -> Dict[str, Any]:
    """
    Delete availability slot
    Args:
        slot_id: Slot ID to delete
        delete_recurring: Whether to delete all recurring instances
        reason: Reason for deletion
    Returns:
        Dict: Deletion result
    """
    try:
        # Get existing slot
        existing_slots = get_appointment_slots(slot_id=slot_id)
        if not existing_slots:
            return {
                "success": False,
                "message": "Slot not found",
                "status_code": 404
            }
        
        slot = existing_slots[0]
        
        # Check if slot is booked
        if slot["status"] == "booked":
            return {
                "success": False,
                "message": "Cannot delete booked slot",
                "status_code": 400
            }
        
        # Delete slot
        success = delete_appointment_slot(slot_id)
        
        if not success:
            return {
                "success": False,
                "message": "Failed to delete slot",
                "status_code": 500
            }
        
        # If delete_recurring is True, delete all related slots
        if delete_recurring:
            availability_id = slot["availability_id"]
            related_slots = get_appointment_slots(availability_id=availability_id)
            
            for related_slot in related_slots:
                if related_slot["id"] != slot_id and related_slot["status"] != "booked":
                    delete_appointment_slot(related_slot["id"])
        
        logger.info(f"Availability slot deleted successfully. Slot ID: {slot_id}, Reason: {reason}")
        
        return {
            "success": True,
            "message": "Slot deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error deleting availability slot: {str(e)}")
        return {
            "success": False,
            "message": "Failed to delete slot",
            "status_code": 500
        }

async def search_availability_slots(search_request: AvailabilitySearchRequest) -> Dict[str, Any]:
    """
    Search for available slots
    Args:
        search_request: Search criteria
    Returns:
        Dict: Search results
    """
    try:
        # Get all available slots
        all_slots = get_appointment_slots()
        
        # Filter slots based on search criteria
        filtered_slots = []
        
        for slot in all_slots:
            # Filter by availability
            if search_request.available_only and slot["status"] != "available":
                continue
            
            # Filter by date
            slot_date = slot["slot_start_time"].date() if isinstance(slot["slot_start_time"], datetime) else datetime.fromisoformat(slot["slot_start_time"].replace('Z', '+00:00')).date()
            
            if search_request.date and slot_date != search_request.date:
                continue
            
            if search_request.start_date and slot_date < search_request.start_date:
                continue
            
            if search_request.end_date and slot_date > search_request.end_date:
                continue
            
            # Filter by appointment type
            if search_request.appointment_type and slot["appointment_type"] != search_request.appointment_type.value:
                continue
            
            # Get provider info (in real implementation, this would come from provider service)
            provider_info = {
                "id": slot["provider_id"],
                "name": f"Dr. Provider {slot['provider_id'][:8]}",
                "specialization": "General Medicine",
                "years_of_experience": 10,
                "rating": 4.5,
                "clinic_address": "123 Medical Center Dr, New York, NY"
            }
            
            # Filter by location (simplified - in real implementation, this would be more sophisticated)
            if search_request.location and search_request.location.lower() not in provider_info["clinic_address"].lower():
                continue
            
            # Filter by pricing
            if search_request.max_price and slot.get("pricing", {}).get("base_fee", 0) > search_request.max_price:
                continue
            
            # Filter by insurance
            if search_request.insurance_accepted is not None:
                slot_insurance = slot.get("pricing", {}).get("insurance_accepted", True)
                if slot_insurance != search_request.insurance_accepted:
                    continue
            
            filtered_slots.append({
                "slot": slot,
                "provider": provider_info
            })
        
        # Group by provider
        providers = {}
        for item in filtered_slots:
            provider_id = item["provider"]["id"]
            if provider_id not in providers:
                providers[provider_id] = {
                    "provider": item["provider"],
                    "available_slots": []
                }
            
            # Convert times to local timezone
            display_timezone = search_request.timezone or "America/New_York"
            start_time = convert_from_utc(item["slot"]["slot_start_time"], display_timezone)
            end_time = convert_from_utc(item["slot"]["slot_end_time"], display_timezone)
            
            slot_info = {
                "slot_id": item["slot"]["id"],
                "date": item["slot"]["slot_start_time"].date().isoformat() if isinstance(item["slot"]["slot_start_time"], datetime) else datetime.fromisoformat(item["slot"]["slot_start_time"].replace('Z', '+00:00')).date().isoformat(),
                "start_time": start_time,
                "end_time": end_time,
                "appointment_type": item["slot"]["appointment_type"],
                "location": item["slot"].get("location"),
                "pricing": item["slot"].get("pricing"),
                "special_requirements": item["slot"].get("special_requirements", [])
            }
            
            providers[provider_id]["available_slots"].append(slot_info)
        
        # Format search criteria
        search_criteria = {}
        if search_request.date:
            search_criteria["date"] = search_request.date.isoformat()
        if search_request.start_date:
            search_criteria["start_date"] = search_request.start_date.isoformat()
        if search_request.end_date:
            search_criteria["end_date"] = search_request.end_date.isoformat()
        if search_request.specialization:
            search_criteria["specialization"] = search_request.specialization
        if search_request.location:
            search_criteria["location"] = search_request.location
        
        return {
            "success": True,
            "data": {
                "search_criteria": search_criteria,
                "total_results": len(providers),
                "results": list(providers.values())
            }
        }
        
    except Exception as e:
        logger.error(f"Error searching availability slots: {str(e)}")
        return {
            "success": False,
            "message": "Failed to search availability",
            "status_code": 500
        } 