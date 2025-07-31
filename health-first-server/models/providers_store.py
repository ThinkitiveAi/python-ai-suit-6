from utils.passwordUtils import hash_password
from datetime import datetime

# In-memory provider store (replace with actual database in production)
PROVIDERS = [
    {
        "id": "provider-123",
        "first_name": "Dr. John",
        "last_name": "Smith",
        "email": "john.smith@healthcare.com",
        "password_hash": hash_password("SecurePassword123!"),
        "specialization": "Cardiology",
        "phone_number": "+1234567890",
        "license_number": "MD123456",
        "years_of_experience": 15,
        "verification_status": "verified",
        "is_active": True,
        "failed_login_attempts": 0,
        "locked_until": None,
        "last_login": None,
        "login_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "provider-456",
        "first_name": "Dr. Sarah",
        "last_name": "Johnson",
        "email": "sarah.johnson@healthcare.com",
        "password_hash": hash_password("SecurePassword123!"),
        "specialization": "Pediatrics",
        "phone_number": "+1234567891",
        "license_number": "MD789012",
        "years_of_experience": 12,
        "verification_status": "verified",
        "is_active": True,
        "failed_login_attempts": 0,
        "locked_until": None,
        "last_login": None,
        "login_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
] 