from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from models.Patient import PatientCreate
from services.patientService import register_patient, login_patient, verify_patient_email, get_patient_profile

router = APIRouter(
    prefix="/api/v1/patient",
    tags=["Patient Management"],
    responses={404: {"description": "Not found"}},
)

class PatientLoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmailVerificationRequest(BaseModel):
    token: str

@router.post('/register', status_code=201, summary="Register Patient", description="Register a new patient with comprehensive validation and HIPAA compliance")
async def register_patient_endpoint(request: Request, patient: PatientCreate):
    """
    Register a new patient with comprehensive validation
    """
    result = await register_patient(request, patient)
    
    if not result['success']:
        status_code = result.get('status_code', 400)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result

@router.post('/login', summary="Patient Login", description="Authenticate patient with email and password")
async def login_patient_endpoint(request: Request, body: PatientLoginRequest):
    """
    Authenticate patient login
    """
    result, code = await login_patient(request, body.dict())
    
    if not result['success']:
        raise HTTPException(status_code=code, detail=result)
    
    return result

@router.post('/verify-email', summary="Verify Email", description="Verify patient email with verification token")
async def verify_patient_email_endpoint(request: Request, body: EmailVerificationRequest):
    """
    Verify patient email with token
    """
    result = await verify_patient_email(body.token)
    
    if not result['success']:
        status_code = result.get('status_code', 400)
        raise HTTPException(status_code=status_code, detail=result)
    
    return result

@router.get('/profile/{patient_id}', summary="Get Patient Profile", description="Retrieve patient profile (HIPAA compliant)")
async def get_patient_profile_endpoint(request: Request, patient_id: str):
    """
    Get patient profile (HIPAA compliant)
    """
    result, code = await get_patient_profile(patient_id)
    
    if not result['success']:
        raise HTTPException(status_code=code, detail=result)
    
    return result

@router.post('/logout', summary="Patient Logout", description="Logout patient and invalidate session")
async def logout_patient_endpoint(request: Request):
    """
    Logout patient (stub implementation)
    """
    return {"success": True, "message": "Logged out successfully"} 