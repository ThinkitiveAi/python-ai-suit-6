from typing import Optional, List, Literal
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, constr, validator
import re
from dateutil.relativedelta import relativedelta

class Address(BaseModel):
    street: constr(strip_whitespace=True, min_length=1, max_length=200) = Field(..., description="Street address")
    city: constr(strip_whitespace=True, min_length=1, max_length=100) = Field(..., description="City")
    state: constr(strip_whitespace=True, min_length=1, max_length=50) = Field(..., description="State/Province")
    zip: constr(strip_whitespace=True, min_length=1, max_length=20) = Field(..., description="Postal code")
    
    @validator('zip')
    def validate_zip_code(cls, v):
        # Basic postal code validation (can be enhanced for specific countries)
        if not re.match(r'^[A-Za-z0-9\s\-]{3,10}$', v):
            raise ValueError('Invalid postal code format')
        return v

class EmergencyContact(BaseModel):
    name: Optional[constr(strip_whitespace=True, max_length=100)] = Field(None, description="Emergency contact name")
    phone: Optional[constr(strip_whitespace=True, min_length=8, max_length=20)] = Field(None, description="Emergency contact phone")
    relationship: Optional[constr(strip_whitespace=True, max_length=50)] = Field(None, description="Relationship to patient")
    
    @validator('phone')
    def validate_emergency_phone(cls, v):
        if v and not re.match(r'^\+?[1-9]\d{7,14}$', v):
            raise ValueError('Invalid phone number format')
        return v

class InsuranceInfo(BaseModel):
    provider: Optional[str] = Field(None, description="Insurance provider name")
    policy_number: Optional[str] = Field(None, description="Insurance policy number")

class PatientBase(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(..., description="Patient's first name")
    last_name: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(..., description="Patient's last name")
    email: EmailStr = Field(..., description="Patient's email address")
    phone_number: constr(strip_whitespace=True, min_length=8, max_length=20) = Field(..., description="Patient's phone number")
    date_of_birth: date = Field(..., description="Patient's date of birth")
    gender: Literal['male', 'female', 'other', 'prefer_not_to_say'] = Field(..., description="Patient's gender")
    address: Address = Field(..., description="Patient's address")
    emergency_contact: Optional[EmergencyContact] = Field(None, description="Emergency contact information")
    medical_history: Optional[List[str]] = Field(None, description="List of medical conditions")
    insurance_info: Optional[InsuranceInfo] = Field(None, description="Insurance information")
    
    @validator('phone_number')
    def validate_phone_number(cls, v):
        # E.164 international format validation
        if not re.match(r'^\+?[1-9]\d{7,14}$', v):
            raise ValueError('Invalid phone number format. Use international format (e.g., +1234567890)')
        return v
    
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        today = date.today()
        age = relativedelta(today, v).years
        
        # COPPA compliance: must be at least 13 years old
        if age < 13:
            raise ValueError('Patient must be at least 13 years old for COPPA compliance')
        
        # Check if date is in the past
        if v >= today:
            raise ValueError('Date of birth must be in the past')
        
        return v

class PatientCreate(PatientBase):
    password: constr(min_length=8) = Field(..., description="Password (8+ chars, upper, lower, number, special)")
    confirm_password: constr(min_length=8) = Field(..., description="Password confirmation")
    
    @validator('password')
    def validate_password_strength(cls, v):
        # Password must contain: 8+ characters, uppercase, lowercase, number, special character
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).{8,}$', v):
            raise ValueError('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character')
        return v
    
    @validator('confirm_password')
    def validate_password_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class PatientDB(PatientBase):
    id: str = Field(..., description="Patient unique identifier")
    password_hash: str = Field(..., description="Hashed password")
    email_verified: bool = Field(default=False, description="Email verification status")
    phone_verified: bool = Field(default=False, description="Phone verification status")
    is_active: bool = Field(default=True, description="Account active status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
        # HIPAA compliance: exclude sensitive fields from serialization
        exclude = {'password_hash'}

class PatientResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    errors: Optional[dict] = None 