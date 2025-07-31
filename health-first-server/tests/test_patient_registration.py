import pytest
from datetime import date, datetime
from models.Patient import PatientCreate, Address, EmergencyContact, InsuranceInfo
from services.patientValidationService import (
    validate_patient_registration,
    validate_patient_login,
    is_valid_email,
    is_valid_phone,
    is_valid_password,
    is_valid_postal_code,
    is_valid_date_of_birth
)
from services.patientService import register_patient, login_patient
from utils.jwtUtils import create_jwt_token, decode_jwt_token, PATIENT_ACCESS_TOKEN_EXPIRES
from utils.passwordUtils import hash_password, verify_password
from models.patients_store import PATIENTS
import re

class TestPatientValidation:
    """Test patient validation functions"""
    
    def test_valid_email(self):
        """Test valid email validation"""
        assert is_valid_email("test@example.com") == True
        assert is_valid_email("user.name+tag@domain.co.uk") == True
        assert is_valid_email("invalid-email") == False
        assert is_valid_email("") == False
    
    def test_valid_phone(self):
        """Test phone number validation (E.164 format)"""
        assert is_valid_phone("+1234567890") == True
        assert is_valid_phone("1234567890") == True
        assert is_valid_phone("+1-234-567-8900") == False  # Invalid format
        assert is_valid_phone("123") == False  # Too short
        assert is_valid_phone("") == False
    
    def test_valid_password(self):
        """Test password strength validation"""
        # Valid passwords
        assert is_valid_password("SecurePass123!") == True
        assert is_valid_password("MyP@ssw0rd") == True
        
        # Invalid passwords
        assert is_valid_password("weak") == False  # Too short
        assert is_valid_password("nouppercase123!") == False  # No uppercase
        assert is_valid_password("NOLOWERCASE123!") == False  # No lowercase
        assert is_valid_password("NoNumbers!") == False  # No numbers
        assert is_valid_password("NoSpecial123") == False  # No special chars
    
    def test_valid_postal_code(self):
        """Test postal code validation"""
        assert is_valid_postal_code("12345") == True
        assert is_valid_postal_code("A1B2C3") == True
        assert is_valid_postal_code("12345-6789") == True
        assert is_valid_postal_code("12") == False  # Too short
        assert is_valid_postal_code("") == False
    
    def test_valid_date_of_birth(self):
        """Test date of birth validation for COPPA compliance"""
        today = date.today()
        
        # Valid dates (13+ years old)
        valid_dob = date(today.year - 25, today.month, today.day)
        is_valid, msg = is_valid_date_of_birth(valid_dob)
        assert is_valid == True
        assert msg == ""
        
        # Invalid dates
        future_date = date(today.year + 1, today.month, today.day)
        is_valid, msg = is_valid_date_of_birth(future_date)
        assert is_valid == False
        assert "past" in msg
        
        # Under 13 years old
        young_dob = date(today.year - 10, today.month, today.day)
        is_valid, msg = is_valid_date_of_birth(young_dob)
        assert is_valid == False
        assert "13 years old" in msg

class TestPatientRegistrationValidation:
    """Test comprehensive patient registration validation"""
    
    def setup_method(self):
        """Clear patient store before each test"""
        PATIENTS.clear()
    
    def test_valid_patient_registration(self):
        """Test valid patient registration data"""
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@email.com",
            "phone_number": "+1234567890",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "date_of_birth": "1990-05-15",
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
            "insurance_info": {
                "provider": "Blue Cross",
                "policy_number": "BC123456789"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is None
    
    def test_duplicate_email_registration(self):
        """Test duplicate email validation"""
        # Add existing patient
        PATIENTS.append({
            "email": "existing@email.com",
            "phone_number": "+1234567890"
        })
        
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "existing@email.com",  # Duplicate email
            "phone_number": "+1234567891",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "date_of_birth": "1990-05-15",
            "gender": "female",
            "address": {
                "street": "456 Main Street",
                "city": "Boston",
                "state": "MA",
                "zip": "02101"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is not None
        assert "email" in errors
        assert "already registered" in errors["email"][0]
    
    def test_duplicate_phone_registration(self):
        """Test duplicate phone number validation"""
        # Add existing patient
        PATIENTS.append({
            "email": "existing@email.com",
            "phone_number": "+1234567890"
        })
        
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "new@email.com",
            "phone_number": "+1234567890",  # Duplicate phone
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "date_of_birth": "1990-05-15",
            "gender": "female",
            "address": {
                "street": "456 Main Street",
                "city": "Boston",
                "state": "MA",
                "zip": "02101"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is not None
        assert "phone_number" in errors
        assert "already registered" in errors["phone_number"][0]
    
    def test_weak_password_validation(self):
        """Test password strength validation"""
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@email.com",
            "phone_number": "+1234567890",
            "password": "weak",  # Weak password
            "confirm_password": "weak",
            "date_of_birth": "1990-05-15",
            "gender": "female",
            "address": {
                "street": "456 Main Street",
                "city": "Boston",
                "state": "MA",
                "zip": "02101"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is not None
        assert "password" in errors
        assert "8 characters" in errors["password"][0]
    
    def test_password_mismatch_validation(self):
        """Test password confirmation validation"""
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@email.com",
            "phone_number": "+1234567890",
            "password": "SecurePassword123!",
            "confirm_password": "DifferentPassword123!",  # Mismatch
            "date_of_birth": "1990-05-15",
            "gender": "female",
            "address": {
                "street": "456 Main Street",
                "city": "Boston",
                "state": "MA",
                "zip": "02101"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is not None
        assert "confirm_password" in errors
        assert "do not match" in errors["confirm_password"][0]
    
    def test_invalid_date_of_birth_validation(self):
        """Test date of birth validation"""
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@email.com",
            "phone_number": "+1234567890",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "date_of_birth": "2015-05-15",  # Under 13 years old
            "gender": "female",
            "address": {
                "street": "456 Main Street",
                "city": "Boston",
                "state": "MA",
                "zip": "02101"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is not None
        assert "date_of_birth" in errors
        assert "13 years old" in errors["date_of_birth"][0]
    
    def test_invalid_gender_validation(self):
        """Test gender validation"""
        patient_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@email.com",
            "phone_number": "+1234567890",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "date_of_birth": "1990-05-15",
            "gender": "invalid_gender",  # Invalid gender
            "address": {
                "street": "456 Main Street",
                "city": "Boston",
                "state": "MA",
                "zip": "02101"
            }
        }
        
        errors = validate_patient_registration(patient_data)
        assert errors is not None
        assert "gender" in errors
        assert "must be one of" in errors["gender"][0]

class TestPatientService:
    """Test patient service functions"""
    
    def setup_method(self):
        """Clear patient store before each test"""
        PATIENTS.clear()
    
    @pytest.mark.asyncio
    async def test_successful_patient_registration(self):
        """Test successful patient registration"""
        patient = PatientCreate(
            first_name="Jane",
            last_name="Smith",
            email="jane.smith@email.com",
            phone_number="+1234567890",
            password="SecurePassword123!",
            confirm_password="SecurePassword123!",
            date_of_birth=date(1990, 5, 15),
            gender="female",
            address=Address(
                street="456 Main Street",
                city="Boston",
                state="MA",
                zip="02101"
            ),
            emergency_contact=EmergencyContact(
                name="John Smith",
                phone="+1234567891",
                relationship="spouse"
            ),
            insurance_info=InsuranceInfo(
                provider="Blue Cross",
                policy_number="BC123456789"
            )
        )
        
        # Mock request object
        class MockRequest:
            pass
        
        request = MockRequest()
        result = await register_patient(request, patient)
        
        assert result["success"] == True
        assert "Patient registered successfully" in result["message"]
        assert "patient_id" in result["data"]
        assert result["data"]["email"] == "jane.smith@email.com"
        assert result["data"]["email_verified"] == False
        assert result["data"]["phone_verified"] == False
        
        # Verify patient was stored
        assert len(PATIENTS) == 1
        stored_patient = PATIENTS[0]
        assert stored_patient["email"] == "jane.smith@email.com"
        assert "password_hash" in stored_patient  # Password should be hashed
        assert stored_patient["password_hash"] != "SecurePassword123!"  # Should not store plain text

class TestHIPAACompliance:
    """Test HIPAA compliance features"""
    
    def setup_method(self):
        """Clear patient store before each test"""
        PATIENTS.clear()
    
    def test_password_hashing_security(self):
        """Test that passwords are properly hashed"""
        # This would be tested in the actual service implementation
        # For now, we verify the validation ensures strong passwords
        assert is_valid_password("SecurePassword123!") == True
        assert is_valid_password("weak") == False
    
    def test_sensitive_data_exclusion(self):
        """Test that sensitive data is not exposed in responses"""
        # This would be tested in the actual API responses
        # The PatientDB model excludes password_hash from serialization
        pass

class TestPatientLoginValidation:
    """Test patient login validation functions"""
    
    def test_valid_login_credentials(self):
        """Test valid login credentials validation"""
        errors = validate_patient_login("jane.smith@email.com", "SecurePassword123!")
        assert errors is None
    
    def test_empty_email_validation(self):
        """Test empty email validation"""
        errors = validate_patient_login("", "SecurePassword123!")
        assert errors is not None
        assert "email" in errors
        assert "required" in errors["email"][0]
    
    def test_empty_password_validation(self):
        """Test empty password validation"""
        errors = validate_patient_login("jane.smith@email.com", "")
        assert errors is not None
        assert "password" in errors
        assert "required" in errors["password"][0]
    
    def test_invalid_email_format_validation(self):
        """Test invalid email format validation"""
        errors = validate_patient_login("invalid-email", "SecurePassword123!")
        assert errors is not None
        assert "email" in errors
        assert "Invalid email format" in errors["email"][0]
    
    def test_whitespace_only_credentials_validation(self):
        """Test whitespace-only credentials validation"""
        errors = validate_patient_login("   ", "   ")
        assert errors is not None
        assert "email" in errors
        assert "password" in errors

class TestPatientLoginService:
    """Test patient login service functions"""
    
    def setup_method(self):
        """Clear patient store and add test patient before each test"""
        PATIENTS.clear()
        
        # Add a test patient for login tests
        test_patient = {
            "id": "test-patient-id-123",
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
            "insurance_info": {
                "provider": "Blue Cross",
                "policy_number": "BC123456789"
            },
            "email_verified": True,
            "phone_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        PATIENTS.append(test_patient)
    
    @pytest.mark.asyncio
    async def test_successful_patient_login(self):
        """Test successful patient login with JWT token generation"""
        # Mock request object
        class MockRequest:
            pass
        
        request = MockRequest()
        login_data = {
            "email": "jane.smith@email.com",
            "password": "SecurePassword123!"
        }
        
        result, status_code = await login_patient(request, login_data)
        
        assert result["success"] == True
        assert result["message"] == "Login successful"
        assert status_code == 200
        
        # Verify JWT token structure
        data = result["data"]
        assert "access_token" in data
        assert "expires_in" in data
        assert "token_type" in data
        assert "patient" in data
        
        # Verify token properties
        assert data["expires_in"] == PATIENT_ACCESS_TOKEN_EXPIRES
        assert data["token_type"] == "Bearer"
        
        # Verify JWT token payload
        token_payload = decode_jwt_token(data["access_token"])
        assert token_payload["patient_id"] == "test-patient-id-123"
        assert token_payload["email"] == "jane.smith@email.com"
        assert token_payload["role"] == "patient"
        assert "exp" in token_payload
        assert "iat" in token_payload
        
        # Verify patient data
        patient_data = data["patient"]
        assert patient_data["patient_id"] == "test-patient-id-123"
        assert patient_data["email"] == "jane.smith@email.com"
        assert patient_data["first_name"] == "Jane"
        assert patient_data["last_name"] == "Smith"
        assert patient_data["email_verified"] == True
        assert patient_data["phone_verified"] == False
        assert patient_data["is_active"] == True
    
    @pytest.mark.asyncio
    async def test_login_invalid_email(self):
        """Test login with invalid email"""
        class MockRequest:
            pass
        
        request = MockRequest()
        login_data = {
            "email": "nonexistent@email.com",
            "password": "SecurePassword123!"
        }
        
        result, status_code = await login_patient(request, login_data)
        
        assert result["success"] == False
        assert result["message"] == "Invalid email or password"
        assert status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_invalid_password(self):
        """Test login with invalid password"""
        class MockRequest:
            pass
        
        request = MockRequest()
        login_data = {
            "email": "jane.smith@email.com",
            "password": "WrongPassword123!"
        }
        
        result, status_code = await login_patient(request, login_data)
        
        assert result["success"] == False
        assert result["message"] == "Invalid email or password"
        assert status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_deactivated_account(self):
        """Test login with deactivated account"""
        # Deactivate the test patient
        PATIENTS[0]["is_active"] = False
        
        class MockRequest:
            pass
        
        request = MockRequest()
        login_data = {
            "email": "jane.smith@email.com",
            "password": "SecurePassword123!"
        }
        
        result, status_code = await login_patient(request, login_data)
        
        assert result["success"] == False
        assert result["message"] == "Account is deactivated"
        assert status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_validation_errors(self):
        """Test login with validation errors"""
        class MockRequest:
            pass
        
        request = MockRequest()
        
        # Test empty email
        login_data = {
            "email": "",
            "password": "SecurePassword123!"
        }
        
        result, status_code = await login_patient(request, login_data)
        
        assert result["success"] == False
        assert result["message"] == "Validation failed"
        assert "errors" in result
        assert status_code == 422
        
        # Test invalid email format
        login_data = {
            "email": "invalid-email",
            "password": "SecurePassword123!"
        }
        
        result, status_code = await login_patient(request, login_data)
        
        assert result["success"] == False
        assert result["message"] == "Validation failed"
        assert "errors" in result
        assert status_code == 422

class TestJWTTokenGeneration:
    """Test JWT token generation and validation"""
    
    def test_jwt_token_creation(self):
        """Test JWT token creation with patient data"""
        payload = {
            "patient_id": "test-patient-id-123",
            "email": "jane.smith@email.com",
            "role": "patient"
        }
        
        token = create_jwt_token(payload, PATIENT_ACCESS_TOKEN_EXPIRES)
        
        # Verify token is a string
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Verify token can be decoded
        decoded_payload = decode_jwt_token(token)
        
        # Verify payload contains all required fields
        assert decoded_payload["patient_id"] == "test-patient-id-123"
        assert decoded_payload["email"] == "jane.smith@email.com"
        assert decoded_payload["role"] == "patient"
        assert "exp" in decoded_payload
        assert "iat" in decoded_payload
    
    def test_jwt_token_expiry(self):
        """Test JWT token expiry handling"""
        payload = {
            "patient_id": "test-patient-id-123",
            "email": "jane.smith@email.com",
            "role": "patient"
        }
        
        # Create token with 30 minutes expiry
        token = create_jwt_token(payload, PATIENT_ACCESS_TOKEN_EXPIRES)
        decoded_payload = decode_jwt_token(token)
        
        # Verify expiry time is set correctly
        assert decoded_payload["exp"] > decoded_payload["iat"]
        
        # Verify expiry is approximately 30 minutes from creation
        time_diff = decoded_payload["exp"] - decoded_payload["iat"]
        assert abs(time_diff - PATIENT_ACCESS_TOKEN_EXPIRES) < 5  # Allow 5 second tolerance

class TestPasswordVerification:
    """Test password verification with bcrypt"""
    
    def test_password_hashing_and_verification(self):
        """Test password hashing and verification"""
        password = "SecurePassword123!"
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Verify password
        assert verify_password(password, hashed_password) == True
        
        # Verify wrong password fails
        assert verify_password("WrongPassword123!", hashed_password) == False
    
    def test_password_verification_security(self):
        """Test that password verification is secure"""
        password = "SecurePassword123!"
        hashed_password = hash_password(password)
        
        # Verify that the same password hashed multiple times produces different hashes
        hashed_password2 = hash_password(password)
        assert hashed_password != hashed_password2
        
        # But both should verify correctly
        assert verify_password(password, hashed_password) == True
        assert verify_password(password, hashed_password2) == True

if __name__ == "__main__":
    pytest.main([__file__]) 