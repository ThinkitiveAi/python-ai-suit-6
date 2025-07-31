import re
from email_validator import validate_email, EmailNotValidError

SPECIALIZATIONS = [
    'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Psychiatry', 'Oncology', 'Orthopedics', 'General Medicine'
]

def is_valid_email(email: str) -> bool:
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

def is_valid_phone(phone: str) -> bool:
    # E.164 international format
    return bool(re.match(r'^\+?[1-9]\d{7,14}$', phone))

def is_valid_password(password: str) -> bool:
    # 8+ chars, upper, lower, number, special
    return bool(re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).{8,}$', password))

def is_valid_license_number(license_number: str) -> bool:
    return bool(re.match(r'^[a-zA-Z0-9]+$', license_number))

def is_valid_specialization(specialization: str) -> bool:
    return specialization in SPECIALIZATIONS 

def validate_provider_registration(provider, providers):
    errors = {}
    # Email format and uniqueness
    try:
        validate_email(provider.email)
    except EmailNotValidError:
        errors['email'] = 'Invalid email format.'
    if any(p['email'] == provider.email for p in providers):
        errors['email'] = 'Email already exists.'
    # Phone format and uniqueness
    if not re.match(r'^\+?[1-9]\d{7,14}$', provider.phone_number):
        errors['phone_number'] = 'Invalid phone number format.'
    if any(p['phone_number'] == provider.phone_number for p in providers):
        errors['phone_number'] = 'Phone number already exists.'
    # Password strength
    if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).{8,}$', provider.password):
        errors['password'] = 'Password must be 8+ chars, upper, lower, number, special.'
    if provider.password != provider.confirm_password:
        errors['confirm_password'] = 'Passwords do not match.'
    # License number
    if not re.match(r'^[a-zA-Z0-9]+$', provider.license_number):
        errors['license_number'] = 'License number must be alphanumeric.'
    if any(p['license_number'] == provider.license_number for p in providers):
        errors['license_number'] = 'License number already exists.'
    # Specialization
    if provider.specialization not in SPECIALIZATIONS:
        errors['specialization'] = 'Invalid specialization.'
    # Required fields (handled by Pydantic, but double-check)
    for field in ['first_name', 'last_name', 'email', 'phone_number', 'password', 'specialization', 'license_number', 'clinic_address']:
        if not getattr(provider, field, None):
            errors[field] = 'This field is required.'
    return errors if errors else None 