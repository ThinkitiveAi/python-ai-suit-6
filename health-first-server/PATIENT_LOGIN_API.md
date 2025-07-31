# Patient Login API Documentation

## Overview
The Patient Login API provides secure JWT-based authentication for patients to access their health information and services.

## Endpoint
```
POST /api/v1/patient/login
```

## Request Body
```json
{
  "email": "jane.smith@email.com",
  "password": "SecurePassword123!"
}
```

### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Patient's email address (must be valid format) |
| password | string | Yes | Patient's password (non-empty) |

## Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 1800,
    "token_type": "Bearer",
    "patient": {
      "patient_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane.smith@email.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "email_verified": true,
      "phone_verified": false,
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
      "medical_history": [],
      "insurance_info": {
        "provider": "Blue Cross",
        "policy_number": "BC123456789"
      },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password is required"]
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Account Deactivated (401)
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Login failed. Please try again."
}
```

## JWT Token Configuration

### Token Properties
- **Type**: Bearer
- **Algorithm**: HS256
- **Expiry**: 30 minutes (1800 seconds)
- **Payload Fields**:
  - `patient_id`: Unique patient identifier
  - `email`: Patient's email address
  - `role`: User role ("patient")
  - `exp`: Token expiration timestamp
  - `iat`: Token issued timestamp

### Using the Access Token
Include the token in the Authorization header for subsequent API calls:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12+ salt rounds
- Password verification uses constant-time comparison
- Plain text passwords are never stored or logged

### JWT Security
- Tokens expire after 30 minutes for security
- Tokens contain minimal necessary information
- Server-side token validation on each request

### HIPAA Compliance
- All login attempts are logged for audit purposes
- Sensitive data is not exposed in error messages
- Account status is verified before authentication

## Validation Rules

### Email Validation
- Must be a valid email format
- Cannot be empty or whitespace-only
- Case-insensitive matching

### Password Validation
- Must be provided and non-empty
- Cannot be whitespace-only
- Actual password strength is verified against stored hash

## Example Usage

### cURL Example
```bash
curl -X POST "http://localhost:8000/api/v1/patient/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@email.com",
    "password": "SecurePassword123!"
  }'
```

### JavaScript Example
```javascript
const loginData = {
  email: "jane.smith@email.com",
  password: "SecurePassword123!"
};

fetch('/api/v1/patient/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Store the access token
    localStorage.setItem('access_token', data.data.access_token);
    console.log('Login successful:', data.data.patient);
  } else {
    console.error('Login failed:', data.message);
  }
});
```

### Python Example
```python
import requests

login_data = {
    "email": "jane.smith@email.com",
    "password": "SecurePassword123!"
}

response = requests.post(
    "http://localhost:8000/api/v1/patient/login",
    json=login_data
)

if response.status_code == 200:
    data = response.json()
    if data["success"]:
        access_token = data["data"]["access_token"]
        patient_info = data["data"]["patient"]
        print(f"Login successful for {patient_info['first_name']} {patient_info['last_name']}")
    else:
        print(f"Login failed: {data['message']}")
else:
    print(f"Request failed with status code: {response.status_code}")
```

## Testing

### Unit Tests
The login functionality includes comprehensive unit tests covering:
- Input validation (email format, password presence)
- Password verification with bcrypt
- JWT token generation and validation
- Login service with various scenarios
- Error handling and edge cases

### Test Commands
```bash
# Run all login-related tests
python -m pytest tests/test_patient_registration.py::TestPatientLoginValidation -v
python -m pytest tests/test_patient_registration.py::TestPatientLoginService -v
python -m pytest tests/test_patient_registration.py::TestJWTTokenGeneration -v
python -m pytest tests/test_patient_registration.py::TestPasswordVerification -v

# Run manual test script
python test_login_manual.py
```

## Rate Limiting
The login endpoint is protected by rate limiting to prevent brute force attacks:
- Maximum 5 login attempts per minute per IP address
- Additional security measures include account lockout after multiple failed attempts

## Best Practices

### Client-Side
1. Always use HTTPS in production
2. Store tokens securely (HttpOnly cookies recommended)
3. Implement token refresh logic
4. Handle token expiration gracefully
5. Never store passwords in plain text

### Server-Side
1. Use environment variables for JWT secrets
2. Implement proper logging for security audits
3. Monitor for suspicious login patterns
4. Regularly rotate JWT secrets
5. Implement proper session management

## Related Endpoints
- `POST /api/v1/patient/register` - Patient registration
- `POST /api/v1/patient/verify-email` - Email verification
- `GET /api/v1/patient/profile/{patient_id}` - Get patient profile
- `POST /api/v1/patient/logout` - Patient logout 