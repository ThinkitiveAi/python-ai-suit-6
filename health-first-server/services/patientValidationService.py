import re
from datetime import date
from dateutil.relativedelta import relativedelta
from email_validator import validate_email, EmailNotValidError
from models.patients_store import PATIENTS

def is_valid_email(email: str) -> bool:
    """Validate email format and return True if valid"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

def is_valid_phone(phone: str) -> bool:
    """Validate phone number in E.164 international format"""
    return bool(re.match(r'^\+?[1-9]\d{7,14}$', phone))

def is_valid_password(password: str) -> bool:
    """Validate password strength: 8+ chars, upper, lower, number, special"""
    return bool(re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).{8,}$', password))

def is_valid_postal_code(zip_code: str) -> bool:
    """Validate postal code format"""
    return bool(re.match(r'^[A-Za-z0-9\s\-]{3,10}$', zip_code))

def is_valid_date_of_birth(dob: date) -> tuple[bool, str]:
    """Validate date of birth for COPPA compliance and past date"""
    today = date.today()
    age = relativedelta(today, dob).years
    
    if dob >= today:
        return False, "Date of birth must be in the past"
    
    if age < 13:
        return False, "Patient must be at least 13 years old for COPPA compliance"
    
    return True, ""

def validate_patient_registration(patient_data: dict) -> dict:
    """
    Comprehensive validation for patient registration
    Returns: dict with errors or None if valid
    """
    errors = {}
    
    # Email validation
    if not is_valid_email(patient_data.get('email', '')):
        errors['email'] = ['Invalid email format']
    elif any(p.get('email') == patient_data.get('email') for p in PATIENTS):
        errors['email'] = ['Email is already registered']
    
    # Phone validation
    if not is_valid_phone(patient_data.get('phone_number', '')):
        errors['phone_number'] = ['Invalid phone number format. Use international format (e.g., +1234567890)']
    elif any(p.get('phone_number') == patient_data.get('phone_number') for p in PATIENTS):
        errors['phone_number'] = ['Phone number is already registered']
    
    # Password validation
    password = patient_data.get('password', '')
    if not is_valid_password(password):
        errors['password'] = ['Password must contain at least 8 characters, including uppercase, lowercase, number, and special character']
    
    # Password confirmation
    if password != patient_data.get('confirm_password', ''):
        errors['confirm_password'] = ['Passwords do not match']
    
    # Date of birth validation
    try:
        dob = patient_data.get('date_of_birth')
        if isinstance(dob, str):
            dob = date.fromisoformat(dob)
        
        is_valid, error_msg = is_valid_date_of_birth(dob)
        if not is_valid:
            errors['date_of_birth'] = [error_msg]
    except (ValueError, TypeError):
        errors['date_of_birth'] = ['Invalid date format. Use YYYY-MM-DD']
    
    # Gender validation
    valid_genders = ['male', 'female', 'other', 'prefer_not_to_say']
    if patient_data.get('gender') not in valid_genders:
        errors['gender'] = [f'Gender must be one of: {", ".join(valid_genders)}']
    
    # Address validation
    address = patient_data.get('address', {})
    if not address.get('street'):
        errors['address'] = errors.get('address', {})
        errors['address']['street'] = ['Street address is required']
    
    if not address.get('city'):
        errors['address'] = errors.get('address', {})
        errors['address']['city'] = ['City is required']
    
    if not address.get('state'):
        errors['address'] = errors.get('address', {})
        errors['address']['state'] = ['State is required']
    
    if not address.get('zip'):
        errors['address'] = errors.get('address', {})
        errors['address']['zip'] = ['Postal code is required']
    elif not is_valid_postal_code(address.get('zip')):
        errors['address'] = errors.get('address', {})
        errors['address']['zip'] = ['Invalid postal code format']
    
    # Emergency contact validation (optional)
    emergency_contact = patient_data.get('emergency_contact')
    if emergency_contact:
        if emergency_contact.get('phone') and not is_valid_phone(emergency_contact.get('phone')):
            errors['emergency_contact'] = errors.get('emergency_contact', {})
            errors['emergency_contact']['phone'] = ['Invalid emergency contact phone number format']
    
    # Required fields validation
    required_fields = ['first_name', 'last_name', 'email', 'phone_number', 'password', 'confirm_password', 'date_of_birth', 'gender', 'address']
    for field in required_fields:
        if not patient_data.get(field):
            errors[field] = [f'{field.replace("_", " ").title()} is required']
    
    return errors if errors else None

def validate_patient_login(email: str, password: str) -> dict:
    """
    Validate patient login credentials format
    Returns: dict with errors or None if valid
    """
    errors = {}
    
    # Email validation
    if not email or not email.strip():
        errors['email'] = ['Email is required']
    elif not is_valid_email(email.strip()):
        errors['email'] = ['Invalid email format']
    
    # Password validation
    if not password:
        errors['password'] = ['Password is required']
    elif len(password.strip()) == 0:
        errors['password'] = ['Password cannot be empty']
    
    return errors if errors else None 