from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime, time
from enum import Enum
import uuid

class RecurrencePattern(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class AvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    CANCELLED = "cancelled"
    BLOCKED = "blocked"
    MAINTENANCE = "maintenance"

class AppointmentType(str, Enum):
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"
    TELEMEDICINE = "telemedicine"

class LocationType(str, Enum):
    CLINIC = "clinic"
    HOSPITAL = "hospital"
    TELEMEDICINE = "telemedicine"
    HOME_VISIT = "home_visit"

class Location(BaseModel):
    type: LocationType
    address: Optional[str] = None
    room_number: Optional[str] = None

class Pricing(BaseModel):
    base_fee: float = Field(..., ge=0)
    insurance_accepted: bool = True
    currency: str = "USD"

class ProviderAvailabilityCreate(BaseModel):
    provider_id: str
    date: date
    start_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:mm format
    end_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:mm format
    timezone: str = "America/New_York"
    is_recurring: bool = False
    recurrence_pattern: Optional[RecurrencePattern] = None
    recurrence_end_date: Optional[date] = None
    slot_duration: int = Field(default=30, ge=15, le=480)  # 15 minutes to 8 hours
    break_duration: int = Field(default=0, ge=0, le=120)  # 0 to 2 hours
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    max_appointments_per_slot: int = Field(default=1, ge=1, le=10)
    appointment_type: AppointmentType = AppointmentType.CONSULTATION
    location: Location
    pricing: Optional[Pricing] = None
    notes: Optional[str] = Field(None, max_length=500)
    special_requirements: Optional[List[str]] = []

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if 'start_time' in values:
            start_time = values['start_time']
            if v <= start_time:
                raise ValueError('end_time must be after start_time')
        return v

    @validator('recurrence_end_date')
    def validate_recurrence_end_date(cls, v, values):
        if 'date' in values and v:
            if v <= values['date']:
                raise ValueError('recurrence_end_date must be after the start date')
        return v

    @validator('is_recurring')
    def validate_recurring_fields(cls, v, values):
        if v:
            if 'recurrence_pattern' not in values or not values['recurrence_pattern']:
                raise ValueError('recurrence_pattern is required when is_recurring is true')
            if 'recurrence_end_date' not in values or not values['recurrence_end_date']:
                raise ValueError('recurrence_end_date is required when is_recurring is true')
        return v

class ProviderAvailabilityUpdate(BaseModel):
    start_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    status: Optional[AvailabilityStatus] = None
    notes: Optional[str] = Field(None, max_length=500)
    pricing: Optional[Pricing] = None
    special_requirements: Optional[List[str]] = None

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if 'start_time' in values and values['start_time'] and v:
            if v <= values['start_time']:
                raise ValueError('end_time must be after start_time')
        return v

class AppointmentSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    availability_id: str
    provider_id: str
    slot_start_time: datetime
    slot_end_time: datetime
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    patient_id: Optional[str] = None
    appointment_type: str
    booking_reference: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProviderAvailabilityDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    provider_id: str
    date: date
    start_time: str
    end_time: str
    timezone: str
    is_recurring: bool = False
    recurrence_pattern: Optional[RecurrencePattern] = None
    recurrence_end_date: Optional[date] = None
    slot_duration: int = 30
    break_duration: int = 0
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    max_appointments_per_slot: int = 1
    current_appointments: int = 0
    appointment_type: AppointmentType = AppointmentType.CONSULTATION
    location: Location
    pricing: Optional[Pricing] = None
    notes: Optional[str] = None
    special_requirements: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AvailabilitySearchRequest(BaseModel):
    date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    specialization: Optional[str] = None
    location: Optional[str] = None
    appointment_type: Optional[AppointmentType] = None
    insurance_accepted: Optional[bool] = None
    max_price: Optional[float] = None
    timezone: Optional[str] = None
    available_only: bool = True

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and values['start_date'] and v:
            if v < values['start_date']:
                raise ValueError('end_date must be after or equal to start_date')
        return v 