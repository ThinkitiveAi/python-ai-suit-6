# Provider Availability Management API Documentation

## Overview
The Provider Availability Management API provides comprehensive functionality for healthcare providers to manage their availability slots, including recurring patterns, timezone handling, and patient search capabilities.

## Database Schema

### Provider Availability Schema
```json
{
  "id": "uuid",
  "provider_id": "uuid (required)",
  "date": "YYYY-MM-DD (required)",
  "start_time": "HH:mm (required, 24-hour)",
  "end_time": "HH:mm (required, 24-hour)",
  "timezone": "string (required, e.g., 'America/New_York')",
  "is_recurring": "boolean (default: false)",
  "recurrence_pattern": "enum: daily/weekly/monthly (optional)",
  "recurrence_end_date": "date (optional)",
  "slot_duration": "integer minutes (default: 30)",
  "break_duration": "integer minutes (default: 0)",
  "status": "enum: available/booked/cancelled/blocked/maintenance (default: available)",
  "max_appointments_per_slot": "integer (default: 1)",
  "current_appointments": "integer (default: 0)",
  "appointment_type": "enum: consultation/follow_up/emergency/telemedicine (default: consultation)",
  "location": {
    "type": "enum: clinic/hospital/telemedicine/home_visit",
    "address": "string (if physical location)",
    "room_number": "string (optional)"
  },
  "pricing": {
    "base_fee": "decimal",
    "insurance_accepted": "boolean",
    "currency": "string (default: 'USD')"
  },
  "notes": "text (optional, max: 500)",
  "special_requirements": ["array of strings (optional)"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Appointment Slots Schema
```json
{
  "id": "uuid",
  "availability_id": "uuid (foreign key)",
  "provider_id": "uuid (foreign key)",
  "slot_start_time": "datetime with timezone",
  "slot_end_time": "datetime with timezone",
  "status": "enum: available/booked/cancelled/blocked",
  "patient_id": "uuid (nullable)",
  "appointment_type": "string",
  "booking_reference": "string (unique)"
}
```

## API Endpoints

### 1. Create Availability Slots
**POST** `/api/v1/provider/availability`

Creates provider availability slots with support for recurring patterns.

#### Request Body
```json
{
  "provider_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-02-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "America/New_York",
  "slot_duration": 30,
  "break_duration": 15,
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_end_date": "2024-08-15",
  "appointment_type": "consultation",
  "location": {
    "type": "clinic",
    "address": "123 Medical Center Dr, New York, NY 10001",
    "room_number": "Room 205"
  },
  "pricing": {
    "base_fee": 150.00,
    "insurance_accepted": true,
    "currency": "USD"
  },
  "special_requirements": ["fasting_required", "bring_insurance_card"],
  "notes": "Standard consultation slots"
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Availability slots created successfully",
  "data": {
    "availability_id": "uuid-here",
    "slots_created": 32,
    "date_range": {
      "start": "2024-02-15",
      "end": "2024-08-15"
    },
    "total_appointments_available": 224
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid time range, validation errors
- **409 Conflict**: Time slot conflicts with existing availability
- **500 Internal Server Error**: Server error

### 2. Get Provider Availability
**GET** `/api/v1/provider/{provider_id}/availability`

Retrieves provider availability slots within a specified date range.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |
| status | string | No | Filter by status (available/booked/cancelled/blocked) |
| appointment_type | string | No | Filter by appointment type |
| timezone | string | No | Timezone for display (defaults to provider's timezone) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "provider_id": "550e8400-e29b-41d4-a716-446655440000",
    "availability_summary": {
      "total_slots": 48,
      "available_slots": 32,
      "booked_slots": 14,
      "cancelled_slots": 2
    },
    "availability": [
      {
        "date": "2024-02-15",
        "slots": [
          {
            "slot_id": "uuid-here",
            "start_time": "09:00",
            "end_time": "09:30",
            "status": "available",
            "appointment_type": "consultation",
            "location": {
              "type": "clinic",
              "address": "123 Medical Center Dr",
              "room_number": "Room 205"
            },
            "pricing": {
              "base_fee": 150.00,
              "insurance_accepted": true
            }
          }
        ]
      }
    ]
  }
}
```

### 3. Update Availability Slot
**PUT** `/api/v1/provider/availability/{slot_id}`

Updates a specific availability slot.

#### Request Body
```json
{
  "start_time": "10:00",
  "end_time": "10:30",
  "status": "available",
  "notes": "Updated consultation time",
  "pricing": {
    "base_fee": 175.00
  }
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Slot updated successfully"
}
```

### 4. Delete Availability Slot
**DELETE** `/api/v1/provider/availability/{slot_id}`

Deletes an availability slot with optional recurring deletion.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| delete_recurring | boolean | No | Delete all recurring instances (default: false) |
| reason | string | No | Reason for deletion |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Slot deleted successfully"
}
```

### 5. Search Available Slots
**GET** `/api/v1/provider/availability/search`

Searches for available appointment slots based on various criteria.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | No | Specific date (YYYY-MM-DD) |
| start_date | string | No | Start date for range (YYYY-MM-DD) |
| end_date | string | No | End date for range (YYYY-MM-DD) |
| specialization | string | No | Provider specialization |
| location | string | No | Location (city, state, or zip) |
| appointment_type | string | No | Appointment type |
| insurance_accepted | boolean | No | Filter by insurance acceptance |
| max_price | float | No | Maximum price filter |
| timezone | string | No | Timezone for display |
| available_only | boolean | No | Show only available slots (default: true) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "search_criteria": {
      "date": "2024-02-15",
      "specialization": "cardiology",
      "location": "New York, NY"
    },
    "total_results": 15,
    "results": [
      {
        "provider": {
          "id": "uuid-here",
          "name": "Dr. John Doe",
          "specialization": "Cardiology",
          "years_of_experience": 15,
          "rating": 4.8,
          "clinic_address": "123 Medical Center Dr, New York, NY"
        },
        "available_slots": [
          {
            "slot_id": "uuid-here",
            "date": "2024-02-15",
            "start_time": "10:00",
            "end_time": "10:30",
            "appointment_type": "consultation",
            "location": {
              "type": "clinic",
              "address": "123 Medical Center Dr",
              "room_number": "Room 205"
            },
            "pricing": {
              "base_fee": 150.00,
              "insurance_accepted": true,
              "currency": "USD"
            },
            "special_requirements": ["bring_insurance_card"]
          }
        ]
      }
    ]
  }
}
```

## Timezone Handling

### Supported Timezones
The API supports all standard timezone identifiers (e.g., "America/New_York", "Europe/London", "Asia/Tokyo").

### Time Storage
- All times are stored in UTC in the database
- Times are converted to the provider's local timezone for display
- Daylight saving time transitions are handled automatically

### Example Timezone Conversion
```python
# Provider sets availability in New York timezone
{
  "start_time": "09:00",
  "timezone": "America/New_York"
}

# Stored in database as UTC
# Displayed to users in their local timezone
```

## Recurring Patterns

### Supported Patterns
- **Daily**: Creates slots for every day
- **Weekly**: Creates slots for the same day of the week
- **Monthly**: Creates slots for the same date each month

### Example Recurring Availability
```json
{
  "date": "2024-02-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_end_date": "2024-08-15"
}
```

This creates availability for every Thursday from February 15 to August 15, 2024.

## Conflict Prevention

### Overlap Detection
The API automatically detects and prevents:
- Overlapping time slots for the same provider
- Conflicts with existing appointments
- Invalid time ranges (end_time ≤ start_time)

### Validation Rules
- End time must be after start time
- Slot duration must be between 15 minutes and 8 hours
- Break duration must be between 0 and 2 hours
- Recurrence end date must be after start date

## Example Usage

### cURL Examples

#### Create Single Availability
```bash
curl -X POST "http://localhost:8000/api/v1/provider/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-02-15",
    "start_time": "09:00",
    "end_time": "17:00",
    "timezone": "America/New_York",
    "slot_duration": 30,
    "appointment_type": "consultation",
    "location": {
      "type": "clinic",
      "address": "123 Medical Center Dr, New York, NY"
    }
  }'
```

#### Get Provider Availability
```bash
curl -X GET "http://localhost:8000/api/v1/provider/550e8400-e29b-41d4-a716-446655440000/availability?start_date=2024-02-15&end_date=2024-02-20"
```

#### Search Available Slots
```bash
curl -X GET "http://localhost:8000/api/v1/provider/availability/search?date=2024-02-15&specialization=cardiology&location=New%20York"
```

### JavaScript Examples

#### Create Availability
```javascript
const availabilityData = {
  provider_id: "550e8400-e29b-41d4-a716-446655440000",
  date: "2024-02-15",
  start_time: "09:00",
  end_time: "17:00",
  timezone: "America/New_York",
  slot_duration: 30,
  appointment_type: "consultation",
  location: {
    type: "clinic",
    address: "123 Medical Center Dr, New York, NY"
  }
};

fetch('/api/v1/provider/availability', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(availabilityData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Availability created:', data.data);
  } else {
    console.error('Error:', data.message);
  }
});
```

#### Search Slots
```javascript
const searchParams = new URLSearchParams({
  date: '2024-02-15',
  specialization: 'cardiology',
  location: 'New York, NY',
  available_only: 'true'
});

fetch(`/api/v1/provider/availability/search?${searchParams}`)
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Search results:', data.data.results);
  } else {
    console.error('Error:', data.message);
  }
});
```

## Testing

### Unit Tests
The module includes comprehensive unit tests covering:
- Timezone conversion functions
- Slot generation logic
- Conflict detection
- Recurring pattern generation
- Service functions
- Validation rules

### Test Commands
```bash
# Run all provider availability tests
python -m pytest tests/test_provider_availability.py -v

# Run specific test categories
python -m pytest tests/test_provider_availability.py::TestTimezoneHandling -v
python -m pytest tests/test_provider_availability.py::TestSlotGeneration -v
python -m pytest tests/test_provider_availability.py::TestProviderAvailabilityService -v
```

## Best Practices

### 1. Timezone Management
- Always specify timezone when creating availability
- Use standard timezone identifiers
- Consider daylight saving time transitions
- Display times in user's local timezone

### 2. Recurring Patterns
- Set appropriate end dates for recurring availability
- Consider provider holidays and vacations
- Use weekly patterns for regular schedules
- Use daily patterns for temporary availability

### 3. Conflict Prevention
- Check for conflicts before creating availability
- Provide clear error messages for conflicts
- Allow providers to override conflicts when necessary
- Maintain audit trail of changes

### 4. Performance
- Use appropriate database indexing
- Implement caching for frequently accessed data
- Paginate large result sets
- Optimize search queries

## Error Handling

### Common Error Codes
- **400 Bad Request**: Invalid input data, validation errors
- **404 Not Found**: Provider or slot not found
- **409 Conflict**: Time slot conflicts
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server errors

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "status_code": 400,
  "errors": {
    "field_name": ["Error details"]
  }
}
```

## Security Considerations

### Data Protection
- Validate all input data
- Sanitize user inputs
- Implement rate limiting
- Log all operations for audit

### Access Control
- Verify provider ownership of slots
- Implement proper authentication
- Use HTTPS in production
- Validate user permissions

## Related Endpoints
- `POST /api/v1/provider/register` - Provider registration
- `POST /api/v1/provider/login` - Provider authentication
- `GET /api/v1/provider/profile/{provider_id}` - Get provider profile
- `POST /api/v1/patient/login` - Patient authentication
- `GET /api/v1/patient/profile/{patient_id}` - Get patient profile 