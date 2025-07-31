from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.jwtUtils import decode_jwt_token
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Security scheme for Bearer token
security = HTTPBearer()

async def verify_patient_token(request: Request, credentials: HTTPAuthorizationCredentials = None):
    """
    Verify JWT token for patient authentication
    Args:
        request: FastAPI request object
        credentials: HTTP authorization credentials
    Returns:
        dict: Decoded token payload with patient information
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Get token from Authorization header
        if credentials is None:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing or invalid authorization header",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            token = auth_header.split(" ")[1]
        else:
            token = credentials.credentials
        
        # Decode and validate JWT token
        payload = decode_jwt_token(token)
        
        # Verify required fields
        if not all(key in payload for key in ["patient_id", "email", "role"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify role is patient
        if payload["role"] != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Add patient info to request state for use in route handlers
        request.state.patient_id = payload["patient_id"]
        request.state.patient_email = payload["email"]
        request.state.patient_role = payload["role"]
        
        # Log successful authentication for HIPAA compliance
        logger.info(f"Patient authenticated successfully. ID: {payload['patient_id']}, Email: {payload['email']}")
        
        return payload
        
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_patient_auth(func):
    """
    Decorator to require patient authentication for endpoints
    Usage:
        @app.get("/protected-endpoint")
        @require_patient_auth
        async def protected_endpoint(request: Request):
            patient_id = request.state.patient_id
            return {"message": f"Hello patient {patient_id}"}
    """
    async def wrapper(request: Request, *args, **kwargs):
        await verify_patient_token(request)
        return await func(request, *args, **kwargs)
    
    return wrapper

def get_current_patient(request: Request):
    """
    Get current authenticated patient information from request state
    Args:
        request: FastAPI request object
    Returns:
        dict: Patient information from token
    """
    if not hasattr(request.state, 'patient_id'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "patient_id": request.state.patient_id,
        "email": request.state.patient_email,
        "role": request.state.patient_role
    } 