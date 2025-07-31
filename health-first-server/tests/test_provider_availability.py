import pytest
from datetime import date, datetime, time, timedelta
from models.ProviderAvailability import (
    ProviderAvailabilityCreate,
    ProviderAvailabilityUpdate,
    ProviderAvailabilityDB,
    AppointmentSlot,
    AvailabilitySearchRequest,
    AvailabilityStatus,
    AppointmentType,
    LocationType,
    Location,
    Pricing,
    RecurrencePattern
)
from services.providerAvailabilityService import (
    convert_to_utc,
    convert_from_utc,
    generate_slots_from_availability,
    generate_recurring_slots,
    check_slot_conflicts,
    create_provider_availability,
    get_provider_availability_slots,
    update_availability_slot,
    delete_availability_slot,
    search_availability_slots
)
from models.provider_availability_store import (
    clear_all_data,
    add_provider_availability,
    add_appointment_slot,
    get_provider_availability,
    get_appointment_slots
)
import pytz

class TestTimezoneHandling:
    """Test timezone conversion functions"""
    
    def test_convert_to_utc(self):
        """Test converting local time to UTC"""
        local_time = "09:00"
        date_obj = date(2024, 2, 15)
        timezone_str = "America/New_York"
        
        utc_dt = convert_to_utc(local_time, date_obj, timezone_str)
        
        assert isinstance(utc_dt, datetime)
        assert utc_dt.tzinfo == pytz.UTC
    
    def test_convert_from_utc(self):
        """Test converting UTC time to local time"""
        utc_dt = datetime(2024, 2, 15, 14, 0, 0, tzinfo=pytz.UTC)
        timezone_str = "America/New_York"
        
        local_time = convert_from_utc(utc_dt, timezone_str)
        
        assert isinstance(local_time, str)
        assert len(local_time) == 5
        assert local_time[2] == ":"

class TestSlotGeneration:
    """Test appointment slot generation"""
    
    def setup_method(self):
        clear_all_data()
    
    def test_generate_slots_from_availability(self):
        """Test generating slots from availability"""
        availability = ProviderAvailabilityDB(
            provider_id="test-provider-123",
            date=date(2024, 2, 15),
            start_time="09:00",
            end_time="11:00",
            timezone="America/New_York",
            slot_duration=30,
            break_duration=0,
            appointment_type=AppointmentType.CONSULTATION,
            location=Location(type=LocationType.CLINIC, address="123 Main St")
        )
        
        slots = generate_slots_from_availability(availability)
        
        assert len(slots) == 4
        
        for slot in slots:
            assert slot.provider_id == "test-provider-123"
            assert slot.appointment_type == "consultation"
            assert slot.status == AvailabilityStatus.AVAILABLE

class TestProviderAvailabilityService:
    """Test provider availability service functions"""
    
    def setup_method(self):
        clear_all_data()
    
    @pytest.mark.asyncio
    async def test_create_single_availability(self):
        """Test creating single availability"""
        availability = ProviderAvailabilityCreate(
            provider_id="test-provider-123",
            date=date(2024, 2, 15),
            start_time="09:00",
            end_time="10:00",
            timezone="America/New_York",
            slot_duration=30,
            appointment_type=AppointmentType.CONSULTATION,
            location=Location(type=LocationType.CLINIC, address="123 Main St"),
            pricing=Pricing(base_fee=150.00, insurance_accepted=True)
        )
        
        class MockRequest:
            pass
        
        request = MockRequest()
        result = await create_provider_availability(request, availability)
        
        assert result["success"] == True
        assert result["data"]["slots_created"] == 2
    
    @pytest.mark.asyncio
    async def test_search_availability_slots(self):
        """Test searching availability slots"""
        availability = ProviderAvailabilityCreate(
            provider_id="test-provider-123",
            date=date(2024, 2, 15),
            start_time="09:00",
            end_time="10:00",
            timezone="America/New_York",
            slot_duration=30,
            appointment_type=AppointmentType.CONSULTATION,
            location=Location(type=LocationType.CLINIC, address="123 Main St"),
            pricing=Pricing(base_fee=150.00, insurance_accepted=True)
        )
        
        class MockRequest:
            pass
        
        request = MockRequest()
        await create_provider_availability(request, availability)
        
        search_request = AvailabilitySearchRequest(
            date=date(2024, 2, 15),
            appointment_type=AppointmentType.CONSULTATION,
            available_only=True
        )
        
        result = await search_availability_slots(search_request)
        
        assert result["success"] == True
        assert result["data"]["total_results"] >= 1

if __name__ == "__main__":
    pytest.main([__file__]) 