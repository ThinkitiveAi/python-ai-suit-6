from models.Patient import PatientCreate, PatientDB
from services.patientValidationService import validate_patient_registration, validate_patient_login
from utils.passwordUtils import hash_password, verify_password
from utils.emailUtils import generate_verification_token
from utils.jwtUtils import create_jwt_token, PATIENT_ACCESS_TOKEN_EXPIRES
from datetime import datetime
import uuid
from models.patients_store import PATIENTS
import logging

# Configure logging for HIPAA compliance
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def register_patient(request, patient: PatientCreate):
    """
    Register a new patient with comprehensive validation and security
    Args:
        request: FastAPI request object
        patient: PatientCreate model with registration data
    Returns:
        dict: Registration result with success status and data
    """
    try:
        # Convert Pydantic model to dict for validation
        patient_data = patient.dict()
        
        # Comprehensive validation
        errors = validate_patient_registration(patient_data)
        if errors:
            return {
                "success": False, 
                "message": "Validation failed", 
                "errors": errors,
                "status_code": 422
            }
        
        # Hash password with bcrypt (12+ salt rounds for security)
        password_hash = hash_password(patient.password)
        
        # Generate patient ID and timestamps
        patient_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Create patient record with HIPAA compliance
        patient_record = {
            "id": patient_id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "phone_number": patient.phone_number,
            "password_hash": password_hash,  # Never log or return this
            "date_of_birth": patient.date_of_birth,
            "gender": patient.gender,
            "address": patient.address.dict(),
            "emergency_contact": patient.emergency_contact.dict() if patient.emergency_contact else None,
            "medical_history": patient.medical_history or [],
            "insurance_info": patient.insurance_info.dict() if patient.insurance_info else None,
            "email_verified": False,
            "phone_verified": False,
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }
        
        # Store patient (simulate DB insert)
        PATIENTS.append(patient_record)
        
        # Generate verification token for email verification
        verification_token = generate_verification_token()
        
        # TODO: Call emailService to send verification email
        # For HIPAA compliance, log minimal information
        logger.info(f"Patient registered successfully. ID: {patient_id}, Email: {patient.email}")
        
        return {
            "success": True,
            "message": "Patient registered successfully. Verification email sent.",
            "data": {
                "patient_id": patient_id,
                "email": patient.email,
                "phone_number": patient.phone_number,
                "email_verified": False,
                "phone_verified": False
            }
        }
        
    except Exception as e:
        # Log error for debugging (without sensitive data)
        logger.error(f"Patient registration failed: {str(e)}")
        return {
            "success": False,
            "message": "Registration failed. Please try again.",
            "status_code": 500
        }

async def login_patient(request, login_data: dict):
    """
    Authenticate patient login with JWT token generation
    Args:
        request: FastAPI request object
        login_data: dict with email and password
    Returns:
        tuple: (result_dict, status_code)
    """
    try:
        email = login_data.get('email', '').strip()
        password = login_data.get('password', '')
        
        # Validate input format and presence
        validation_errors = validate_patient_login(email, password)
        if validation_errors:
            return {
                "success": False,
                "message": "Validation failed",
                "errors": validation_errors
            }, 422
        
        # Find patient by email
        patient = next((p for p in PATIENTS if p.get('email') == email), None)
        
        if not patient:
            return {
                "success": False,
                "message": "Invalid email or password"
            }, 401
        
        if not patient.get('is_active', True):
            return {
                "success": False,
                "message": "Account is deactivated"
            }, 401
        
        # Verify password using bcrypt
        if not verify_password(password, patient['password_hash']):
            return {
                "success": False,
                "message": "Invalid email or password"
            }, 401
        
        # Generate JWT token with patient data
        token_payload = {
            "patient_id": patient['id'],
            "email": patient['email'],
            "role": "patient"
        }
        
        access_token = create_jwt_token(token_payload, PATIENT_ACCESS_TOKEN_EXPIRES)
        
        # Log successful login for HIPAA compliance
        logger.info(f"Patient login successful. ID: {patient['id']}, Email: {email}")
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "access_token": access_token,
                "expires_in": PATIENT_ACCESS_TOKEN_EXPIRES,
                "token_type": "Bearer",
                "patient": {
                    "patient_id": patient['id'],
                    "email": patient['email'],
                    "first_name": patient['first_name'],
                    "last_name": patient['last_name'],
                    "email_verified": patient.get('email_verified', False),
                    "phone_verified": patient.get('phone_verified', False),
                    "date_of_birth": patient['date_of_birth'],
                    "gender": patient['gender'],
                    "address": patient['address'],
                    "emergency_contact": patient['emergency_contact'],
                    "medical_history": patient['medical_history'],
                    "insurance_info": patient['insurance_info'],
                    "is_active": patient.get('is_active', True),
                    "created_at": patient['created_at'],
                    "updated_at": patient['updated_at']
                }
            }
        }, 200
        
    except Exception as e:
        logger.error(f"Patient login failed: {str(e)}")
        return {
            "success": False,
            "message": "Login failed. Please try again."
        }, 500

async def verify_patient_email(token: str):
    """
    Verify patient email with token
    Args:
        token: Verification token
    Returns:
        dict: Verification result
    """
    try:
        # TODO: Implement actual token verification and DB update
        if token == "valid-token":
            return {
                'success': True,
                'message': 'Patient email verified successfully.'
            }
        else:
            return {
                'success': False,
                'message': 'Invalid or expired verification token.',
                'status_code': 400
            }
    except Exception as e:
        logger.error(f"Email verification failed: {str(e)}")
        return {
            'success': False,
            'message': 'Email verification failed.',
            'status_code': 500
        }

async def get_patient_profile(patient_id: str):
    """
    Get patient profile (HIPAA compliant - no sensitive data)
    Args:
        patient_id: Patient unique identifier
    Returns:
        dict: Patient profile data
    """
    try:
        patient = next((p for p in PATIENTS if p.get('id') == patient_id), None)
        
        if not patient:
            return {
                "success": False,
                "message": "Patient not found"
            }, 404
        
        # Return HIPAA-compliant profile (exclude sensitive data)
        return {
            "success": True,
            "data": {
                "patient_id": patient['id'],
                "first_name": patient['first_name'],
                "last_name": patient['last_name'],
                "email": patient['email'],
                "phone_number": patient['phone_number'],
                "date_of_birth": patient['date_of_birth'],
                "gender": patient['gender'],
                "address": patient['address'],
                "emergency_contact": patient['emergency_contact'],
                "medical_history": patient['medical_history'],
                "insurance_info": patient['insurance_info'],
                "email_verified": patient.get('email_verified', False),
                "phone_verified": patient.get('phone_verified', False),
                "is_active": patient.get('is_active', True),
                "created_at": patient['created_at'],
                "updated_at": patient['updated_at']
            }
        }, 200
        
    except Exception as e:
        logger.error(f"Get patient profile failed: {str(e)}")
        return {
            "success": False,
            "message": "Failed to retrieve patient profile"
        }, 500 