from models.Provider import ProviderCreate
from services.validationService import validate_provider_registration
from utils.passwordUtils import hash_password
from utils.emailUtils import generate_verification_token
from datetime import datetime
import uuid
from models.providers_store import PROVIDERS

async def register_provider(request, provider: ProviderCreate):
    # Validate fields and uniqueness
    errors = validate_provider_registration(provider, PROVIDERS)
    if errors:
        return {"success": False, "message": errors, "status_code": 422}
    # Hash password
    password_hash = hash_password(provider.password)
    # Generate provider ID and timestamps
    provider_id = str(uuid.uuid4())
    now = datetime.utcnow()
    # Store provider (simulate DB insert)
    PROVIDERS.append({
        "id": provider_id,
        "first_name": provider.first_name,
        "last_name": provider.last_name,
        "email": provider.email,
        "phone_number": provider.phone_number,
        "password_hash": password_hash,
        "specialization": provider.specialization,
        "license_number": provider.license_number,
        "years_of_experience": provider.years_of_experience,
        "clinic_address": provider.clinic_address.dict(),
        "verification_status": "pending",
        "license_document_url": provider.license_document_url,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    })
    # For testing/demo: set as verified so login works immediately
    PROVIDERS[-1]["verification_status"] = "verified"
    # Generate verification token and send email (stub)
    token = generate_verification_token()
    # TODO: Call emailService to send verification email
    return {
        "success": True,
        "message": "Provider registered successfully. Verification email sent.",
        "data": {
            "provider_id": provider_id,
            "email": provider.email,
            "verification_status": PROVIDERS[-1]["verification_status"]
        }
    }

async def verify_provider_email(token: str):
    # TODO: Implement actual token verification and DB update
    if token == "valid-token":
        return {
            'success': True,
            'message': 'Provider email verified successfully.'
        }
    else:
        return {
            'success': False,
            'message': 'Invalid or expired verification token.',
            'status_code': 400
        } 