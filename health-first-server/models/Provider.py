from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, constr

class ClinicAddress(BaseModel):
    street: constr(strip_whitespace=True, min_length=1, max_length=200)
    city: constr(strip_whitespace=True, min_length=1, max_length=100)
    state: constr(strip_whitespace=True, min_length=1, max_length=50)
    zip: constr(strip_whitespace=True, min_length=1, max_length=20)

class ProviderBase(BaseModel):
    first_name: constr(strip_whitespace=True, min_length=2, max_length=50)
    last_name: constr(strip_whitespace=True, min_length=2, max_length=50)
    email: EmailStr
    phone_number: constr(strip_whitespace=True, min_length=8, max_length=20)
    specialization: constr(strip_whitespace=True, min_length=3, max_length=100)
    license_number: constr(strip_whitespace=True, min_length=1, max_length=30, pattern=r'^[a-zA-Z0-9]+$')
    years_of_experience: int = Field(..., ge=0, le=50)
    clinic_address: ClinicAddress
    license_document_url: Optional[str]

class ProviderCreate(ProviderBase):
    password: constr(min_length=8)
    confirm_password: constr(min_length=8)

class ProviderDB(ProviderBase):
    id: str
    password_hash: str
    verification_status: Literal['pending', 'verified', 'rejected'] = 'pending'
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 