# app/schemas/community.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PostCreate(BaseModel):
    content: str

class PostUpdate(BaseModel):
    content: str

class AuthorSummary(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    updated_at: datetime
    author: AuthorSummary

    class Config:
        from_attributes = True