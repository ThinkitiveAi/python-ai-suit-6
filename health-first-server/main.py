from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import providerController, authController, patientController, providerAvailabilityController
from middlewares.rateLimiting import limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

app = FastAPI(
    title="Healthcare Provider & Patient Management API",
    description="""
    A comprehensive healthcare management system with secure provider and patient registration, 
    authentication, and profile management. Features HIPAA compliance, robust validation, 
    and secure authentication.
    
    ## Features
    * **Provider Management**: Registration, authentication, and profile management
    * **Patient Management**: Secure registration with HIPAA compliance
    * **Provider Availability**: Comprehensive availability management with recurring patterns
    * **Authentication**: JWT-based secure authentication
    * **Validation**: Comprehensive input validation and security
    * **CORS**: Cross-origin resource sharing enabled
    """,
    version="1.0.0",
    contact={
        "name": "Healthcare API Support",
        "email": "support@healthcare-api.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Add CORS middleware to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda r, e: ("Rate limit exceeded", 429))
app.add_middleware(SlowAPIMiddleware)

app.include_router(providerController.router)
app.include_router(authController.router)
app.include_router(patientController.router)
app.include_router(providerAvailabilityController.router) 