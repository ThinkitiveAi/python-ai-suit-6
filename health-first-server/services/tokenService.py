from utils.jwtUtils import decode_jwt_token, create_jwt_token, ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES
from services.authService import PROVIDERS
from datetime import datetime

async def refresh_token(request, body):
    refresh_token = body.get('refresh_token')
    if not refresh_token:
        return {"success": False, "message": "Refresh token required", "error_code": "INVALID_REQUEST"}, 400
    try:
        payload = decode_jwt_token(refresh_token)
    except Exception:
        return {"success": False, "message": "Invalid or expired refresh token", "error_code": "INVALID_REFRESH_TOKEN"}, 401
    provider = next((p for p in PROVIDERS if p['id'] == payload.get('provider_id')), None)
    if not provider:
        return {"success": False, "message": "Provider not found", "error_code": "PROVIDER_NOT_FOUND"}, 404
    if not provider['is_active'] or provider['verification_status'] != 'verified':
        return {"success": False, "message": "Account not verified or inactive", "error_code": "ACCOUNT_NOT_VERIFIED"}, 403
    remember_me = (payload.get('exp', 0) - payload.get('iat', 0)) > ACCESS_TOKEN_EXPIRES
    access_exp = ACCESS_TOKEN_EXPIRES if remember_me else ACCESS_TOKEN_EXPIRES
    refresh_exp = REFRESH_TOKEN_EXPIRES if remember_me else REFRESH_TOKEN_EXPIRES
    new_payload = {
        'provider_id': provider['id'],
        'email': provider['email'],
        'role': 'provider',
        'specialization': provider['specialization'],
        'verification_status': provider['verification_status']
    }
    new_access_token = create_jwt_token(new_payload, access_exp)
    new_refresh_token = create_jwt_token(new_payload, refresh_exp)
    return {
        "success": True,
        "message": "Token refreshed successfully",
        "data": {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "expires_in": access_exp,
            "token_type": "Bearer"
        }
    }, 200

async def logout(request, body):
    # TODO: Implement refresh token blacklisting (in-memory stub)
    return {"success": True, "message": "Logged out successfully"}, 200

async def logout_all(request, body):
    # TODO: Implement logout-all (invalidate all sessions, in-memory stub)
    return {"success": True, "message": "Logged out from all sessions"}, 200 