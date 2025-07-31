from models.providers_store import PROVIDERS
from utils.passwordUtils import verify_password
from utils.jwtUtils import create_jwt_token, ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES
from datetime import datetime, timedelta

async def login_provider(request, body):
    email = body.get('email')
    password = body.get('password')
    if not email or not password:
        return {"success": False, "message": "Email and password required", "error_code": "INVALID_REQUEST"}, 400
    # Find provider by email
    provider = next((p for p in PROVIDERS if p['email'] == email), None)
    if not provider:
        return {"success": False, "message": "Invalid credentials", "error_code": "INVALID_CREDENTIALS"}, 401
    # Check lockout
    if provider.get('locked_until') and provider['locked_until'] > datetime.utcnow():
        return {"success": False, "message": "Account locked due to failed attempts", "error_code": "ACCOUNT_LOCKED"}, 423
    # Check password
    if not verify_password(password, provider['password_hash']):
        provider['failed_login_attempts'] = provider.get('failed_login_attempts', 0) + 1
        if provider['failed_login_attempts'] >= 5:
            provider['locked_until'] = datetime.utcnow() + timedelta(minutes=30)
        return {"success": False, "message": "Invalid credentials", "error_code": "INVALID_CREDENTIALS"}, 401
    # Check account status
    if not provider['is_active'] or provider['verification_status'] != 'verified':
        return {"success": False, "message": "Account not verified or inactive", "error_code": "ACCOUNT_NOT_VERIFIED"}, 403
    # Reset failed attempts
    provider['failed_login_attempts'] = 0
    provider['locked_until'] = None
    provider['last_login'] = datetime.utcnow()
    provider['login_count'] = provider.get('login_count', 0) + 1
    # JWT payload
    payload = {
        'provider_id': provider['id'],
        'email': provider['email'],
        'role': 'provider',
        'specialization': provider['specialization'],
        'verification_status': provider['verification_status']
    }
    access_token = create_jwt_token(payload, ACCESS_TOKEN_EXPIRES)
    refresh_token = create_jwt_token(payload, REFRESH_TOKEN_EXPIRES)
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": ACCESS_TOKEN_EXPIRES,
            "token_type": "Bearer",
            "provider": {
                "id": provider['id'],
                "first_name": provider['first_name'],
                "last_name": provider['last_name'],
                "email": provider['email'],
                "specialization": provider['specialization'],
                "verification_status": provider['verification_status'],
                "is_active": provider['is_active']
            }
        }
    }, 200 