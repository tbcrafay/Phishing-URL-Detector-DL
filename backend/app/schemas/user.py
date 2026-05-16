from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Base User fields shared across schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

# Schema for checking user profile outputs (Hides password strings)
class UserResponse(UserBase):
    id: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for the final Session JWT delivered after a successful handshake
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse