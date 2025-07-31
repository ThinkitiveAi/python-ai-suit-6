from utils.passwordUtils import hash_password
from datetime import datetime, date

# In-memory patient store (replace with actual database in production)
PATIENTS = [
    {
        "id": "patient-123",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@email.com",
        "phone_number": "+1234567890",
        "password_hash": hash_password("SecurePassword123!"),
        "date_of_birth": date(1990, 5, 15),
        "gender": "female",
        "address": {
            "street": "456 Main Street",
            "city": "Boston",
            "state": "MA",
            "zip": "02101"
        },
        "emergency_contact": {
            "name": "John Smith",
            "phone": "+1234567891",
            "relationship": "spouse"
        },
        "medical_history": [],
        "insurance_info": {
            "provider": "Blue Cross",
            "policy_number": "BC123456789"
        },
        "email_verified": True,
        "phone_verified": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "patient-456",
        "first_name": "Michael",
        "last_name": "Johnson",
        "email": "michael.johnson@email.com",
        "phone_number": "+1234567892",
        "password_hash": hash_password("SecurePassword123!"),
        "date_of_birth": date(1985, 8, 22),
        "gender": "male",
        "address": {
            "street": "789 Oak Avenue",
            "city": "New York",
            "state": "NY",
            "zip": "10001"
        },
        "emergency_contact": {
            "name": "Lisa Johnson",
            "phone": "+1234567893",
            "relationship": "spouse"
        },
        "medical_history": [],
        "insurance_info": {
            "provider": "Aetna",
            "policy_number": "AE987654321"
        },
        "email_verified": True,
        "phone_verified": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
] 