from typing import Literal
from datetime import datetime
from pydantic import BaseModel

class VerificationToken(BaseModel):
    token: str
    patient_id: str
    type: Literal['email', 'phone']
    expires_at: datetime
    created_at: datetime
    used: bool = False 