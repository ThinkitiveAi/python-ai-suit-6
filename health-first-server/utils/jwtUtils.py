import jwt
from datetime import datetime, timedelta
import os

JWT_SECRET = os.getenv('JWT_SECRET', 'supersecretkey')
JWT_ALGORITHM = 'HS256'

# Generate JWT token
def create_jwt_token(payload: dict, expires_in: int) -> str:
    payload = payload.copy()
    payload['exp'] = datetime.utcnow() + timedelta(seconds=expires_in)
    payload['iat'] = datetime.utcnow()
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Decode JWT token
def decode_jwt_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

# Provider token expiry
ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
REFRESH_TOKEN_EXPIRES = 604800  # 7 days

# Patient token expiry (30 minutes as per requirements)
PATIENT_ACCESS_TOKEN_EXPIRES = 1800  # 30 minutes
PATIENT_REFRESH_TOKEN_EXPIRES = 604800  # 7 days 