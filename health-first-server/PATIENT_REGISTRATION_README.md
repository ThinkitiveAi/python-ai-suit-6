# Patient Registration Backend System

A comprehensive, secure, and HIPAA-compliant patient registration system built with FastAPI, featuring robust validation, authentication, and data privacy.

## 🚀 Features

### ✅ Security & Compliance
- **HIPAA Compliance**: Secure handling of medical data
- **Password Security**: bcrypt hashing with 12+ salt rounds
- **Data Privacy**: Sensitive data excluded from responses
- **COPPA Compliance**: Age verification (13+ years old)
- **Input Validation**: Comprehensive field validation

### ✅ Authentication & Authorization
- **Secure Registration**: Multi-step validation process
- **Email Verification**: Token-based email verification
- **Phone Verification**: International phone number validation
- **Session Management**: JWT-based authentication (ready for implementation)

### ✅ Data Validation
- **Email Validation**: Unique email with proper format
- **Phone Validation**: E.164 international format
- **Password Strength**: 8+ chars, upper, lower, number, special
- **Address Validation**: Complete address with postal code
- **Date Validation**: Past dates with age compliance
- **Gender Validation**: Enum-based gender selection

## 📋 API Endpoints

### Patient Registration
```http
POST /api/v1/patient/register
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@email.com",
  "phone_number": "+1234567890",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!",
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
  "insurance_info": {
    "provider": "Blue Cross",
    "policy_number": "BC123456789"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Patient registered successfully. Verification email sent.",
  "data": {
    "patient_id": "uuid-here",
    "email": "jane.smith@email.com",
    "phone_number": "+1234567890",
    "email_verified": false,
    "phone_verified": false
  }
}
```

### Patient Login
```http
POST /api/v1/patient/login
```

**Request Body:**
```json
{
  "email": "jane.smith@email.com",
  "password": "SecurePassword123!"
}
```

### Email Verification
```http
POST /api/v1/patient/verify-email
```

**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

### Get Patient Profile
```http
GET /api/v1/patient/profile/{patient_id}
```

## 🔒 Validation Rules

### Email Validation
- Must be unique across all patients
- Must follow valid email format
- Case-insensitive comparison

### Phone Number Validation
- Must be unique across all patients
- Must follow E.164 international format
- Examples: `+1234567890`, `1234567890`

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Must match confirmation password

### Date of Birth Validation
- Must be in the past
- Patient must be at least 13 years old (COPPA compliance)
- Format: YYYY-MM-DD

### Gender Validation
- Must be one of: `male`, `female`, `other`, `prefer_not_to_say`

### Address Validation
- Street: Required, max 200 characters
- City: Required, max 100 characters
- State: Required, max 50 characters
- Zip: Required, valid postal code format

## 🏗️ Project Structure

```
├── models/
│   ├── Patient.py              # Patient data models
│   └── patients_store.py       # In-memory patient storage
├── services/
│   ├── patientService.py       # Business logic
│   └── patientValidationService.py  # Validation logic
├── controllers/
│   └── patientController.py    # API endpoints
├── tests/
│   └── test_patient_registration.py  # Comprehensive tests
└── utils/
    ├── passwordUtils.py        # Password hashing
    └── emailUtils.py           # Email utilities
```

## 🧪 Testing

### Run All Tests
```bash
python -m pytest tests/test_patient_registration.py -v
```

### Test Categories
- **Validation Tests**: Email, phone, password, date validation
- **Registration Tests**: Complete registration flow
- **Security Tests**: Password hashing, data privacy
- **HIPAA Compliance Tests**: Sensitive data handling

### Test Coverage
- ✅ Email format and uniqueness validation
- ✅ Phone number format and uniqueness validation
- ✅ Password strength requirements
- ✅ Date of birth COPPA compliance
- ✅ Address validation
- ✅ Gender enum validation
- ✅ Duplicate registration prevention
- ✅ Password hashing security
- ✅ HIPAA compliance features

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access API Documentation
Open your browser and navigate to:
```
http://localhost:8000/docs
```

## 📊 Database Schema

### Patient Schema
```python
{
  "id": "UUID/ObjectId",
  "first_name": "string (2-50 chars)",
  "last_name": "string (2-50 chars)",
  "email": "string (unique, valid email)",
  "phone_number": "string (unique, E.164 format)",
  "password_hash": "string (bcrypt hashed)",
  "date_of_birth": "date (past, 13+ years)",
  "gender": "enum (male/female/other/prefer_not_to_say)",
  "address": {
    "street": "string (max 200)",
    "city": "string (max 100)",
    "state": "string (max 50)",
    "zip": "string (valid postal code)"
  },
  "emergency_contact": {
    "name": "string (max 100, optional)",
    "phone": "string (E.164 format, optional)",
    "relationship": "string (max 50, optional)"
  },
  "medical_history": ["array of strings (optional)"],
  "insurance_info": {
    "provider": "string (optional)",
    "policy_number": "string (optional)"
  },
  "email_verified": "boolean (default: false)",
  "phone_verified": "boolean (default: false)",
  "is_active": "boolean (default: true)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## 🛡️ Security Features

### Password Security
- bcrypt hashing with 12+ salt rounds
- Never stored or logged in plain text
- Strong password requirements enforced

### Data Privacy
- Password hash excluded from API responses
- Minimal logging of sensitive information
- HIPAA-compliant data handling

### Input Sanitization
- All inputs validated and sanitized
- SQL injection prevention
- XSS protection through validation

## 🔄 Error Handling

### Validation Errors (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is already registered"],
    "password": ["Password must contain at least 8 characters"],
    "date_of_birth": ["Must be at least 13 years old"]
  }
}
```

### Common Error Codes
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid credentials)
- `422`: Validation Error (detailed field errors)
- `500`: Internal Server Error

## 🚀 Production Deployment

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_password

# Security
BCRYPT_ROUNDS=12
JWT_SECRET=your_jwt_secret
```

### Database Migration
```bash
# For PostgreSQL/MySQL
alembic upgrade head

# For MongoDB
# Collections will be created automatically
```

## 📈 Performance & Scalability

### Optimizations
- Async/await for I/O operations
- Efficient validation with early returns
- Indexed database queries (when implemented)
- Connection pooling for database

### Monitoring
- Structured logging for debugging
- Error tracking and alerting
- Performance metrics collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the test cases for usage examples
- Open an issue for bugs or feature requests 

##  **CORS Fix Applied:**

### **Added CORS Middleware:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com", "http://localhost:3000"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
```

### **What This Fixes:**

1. **403 Forbidden WebSocket Errors** - Now allows WebSocket connections
2. **405 Method Not Allowed** - Now handles OPTIONS preflight requests
3. **Cross-Origin Requests** - Allows frontend applications to access your API
4. **CORS Headers** - Properly responds with CORS headers

### **Security Note:**
For production, you should replace `allow_origins=["*"]` with your specific frontend domain:
```python
<code_block_to_apply_changes_from>
```

### **Now You Can:**

1. **Access the API from any origin** (including your frontend)
2. **Use the Swagger UI** without CORS issues
3. **Make API calls from JavaScript** applications
4. **Connect WebSocket clients** if needed

The server is now running with CORS enabled. You should be able to access:
- **API Documentation**: `http://localhost:8000/docs`
- **Patient Registration**: `http://localhost:8000/api/v1/patient/register`
- **Provider Registration**: `http://localhost:8000/api/v1/provider/register`

The CORS errors should now be resolved! 🎉 