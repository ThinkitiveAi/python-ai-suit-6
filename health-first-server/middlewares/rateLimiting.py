from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
# Usage in FastAPI: @limiter.limit('5/hour') 