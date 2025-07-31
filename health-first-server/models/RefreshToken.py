from typing import Optional
from datetime import datetime

class RefreshToken:
    def __init__(self, id: str, provider_id: str, token_hash: str, expires_at: datetime, is_revoked: bool = False, created_at: Optional[datetime] = None, last_used_at: Optional[datetime] = None):
        self.id = id
        self.provider_id = provider_id
        self.token_hash = token_hash
        self.expires_at = expires_at
        self.is_revoked = is_revoked
        self.created_at = created_at or datetime.utcnow()
        self.last_used_at = last_used_at 