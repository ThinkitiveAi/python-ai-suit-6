"""
Data store for provider availability and appointment slots
In production, this would be replaced with a proper database
"""

from typing import List, Dict, Any
from models.ProviderAvailability import ProviderAvailabilityDB, AppointmentSlot
from datetime import date, datetime, time
import pytz

# In-memory storage for provider availability
PROVIDER_AVAILABILITY: List[Dict[str, Any]] = [
    {
        "id": "availability-123",
        "provider_id": "provider-123",
        "date": date(2024, 2, 15),
        "start_time": "09:00",
        "end_time": "17:00",
        "timezone": "America/New_York",
        "is_recurring": False,
        "recurrence_pattern": None,
        "recurrence_end_date": None,
        "slot_duration": 30,
        "break_duration": 0,
        "status": "available",
        "max_appointments_per_slot": 1,
        "current_appointments": 0,
        "appointment_type": "consultation",
        "location": {
            "type": "clinic",
            "address": "123 Medical Center Dr, New York, NY 10001",
            "room_number": "Room 205"
        },
        "pricing": {
            "base_fee": 150.00,
            "insurance_accepted": True,
            "currency": "USD"
        },
        "notes": "Standard consultation slots",
        "special_requirements": ["bring_insurance_card"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

# In-memory storage for appointment slots
APPOINTMENT_SLOTS: List[Dict[str, Any]] = [
    {
        "id": "slot-123",
        "availability_id": "availability-123",
        "provider_id": "provider-123",
        "slot_start_time": datetime(2024, 2, 15, 14, 0, 0, tzinfo=pytz.UTC),
        "slot_end_time": datetime(2024, 2, 15, 14, 30, 0, tzinfo=pytz.UTC),
        "status": "available",
        "patient_id": None,
        "appointment_type": "consultation",
        "booking_reference": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "slot-124",
        "availability_id": "availability-123",
        "provider_id": "provider-123",
        "slot_start_time": datetime(2024, 2, 15, 14, 30, 0, tzinfo=pytz.UTC),
        "slot_end_time": datetime(2024, 2, 15, 15, 0, 0, tzinfo=pytz.UTC),
        "status": "available",
        "patient_id": None,
        "appointment_type": "consultation",
        "booking_reference": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

def add_provider_availability(availability: ProviderAvailabilityDB) -> str:
    """Add provider availability to store"""
    availability_dict = availability.dict()
    PROVIDER_AVAILABILITY.append(availability_dict)
    return availability_dict["id"]

def get_provider_availability(provider_id: str = None, availability_id: str = None) -> List[Dict[str, Any]]:
    """Get provider availability by provider_id or availability_id"""
    if availability_id:
        return [av for av in PROVIDER_AVAILABILITY if av["id"] == availability_id]
    elif provider_id:
        return [av for av in PROVIDER_AVAILABILITY if av["provider_id"] == provider_id]
    return PROVIDER_AVAILABILITY

def update_provider_availability(availability_id: str, updates: Dict[str, Any]) -> bool:
    """Update provider availability"""
    for availability in PROVIDER_AVAILABILITY:
        if availability["id"] == availability_id:
            availability.update(updates)
            availability["updated_at"] = updates.get("updated_at")
            return True
    return False

def delete_provider_availability(availability_id: str) -> bool:
    """Delete provider availability"""
    for i, availability in enumerate(PROVIDER_AVAILABILITY):
        if availability["id"] == availability_id:
            del PROVIDER_AVAILABILITY[i]
            return True
    return False

def add_appointment_slot(slot: AppointmentSlot) -> str:
    """Add appointment slot to store"""
    slot_dict = slot.dict()
    APPOINTMENT_SLOTS.append(slot_dict)
    return slot_dict["id"]

def get_appointment_slots(provider_id: str = None, availability_id: str = None, slot_id: str = None) -> List[Dict[str, Any]]:
    """Get appointment slots by various criteria"""
    if slot_id:
        return [slot for slot in APPOINTMENT_SLOTS if slot["id"] == slot_id]
    elif availability_id:
        return [slot for slot in APPOINTMENT_SLOTS if slot["availability_id"] == availability_id]
    elif provider_id:
        return [slot for slot in APPOINTMENT_SLOTS if slot["provider_id"] == provider_id]
    return APPOINTMENT_SLOTS

def update_appointment_slot(slot_id: str, updates: Dict[str, Any]) -> bool:
    """Update appointment slot"""
    for slot in APPOINTMENT_SLOTS:
        if slot["id"] == slot_id:
            slot.update(updates)
            slot["updated_at"] = updates.get("updated_at")
            return True
    return False

def delete_appointment_slot(slot_id: str) -> bool:
    """Delete appointment slot"""
    for i, slot in enumerate(APPOINTMENT_SLOTS):
        if slot["id"] == slot_id:
            del APPOINTMENT_SLOTS[i]
            return True
    return False

def clear_all_data():
    """Clear all data (for testing purposes)"""
    PROVIDER_AVAILABILITY.clear()
    APPOINTMENT_SLOTS.clear() 