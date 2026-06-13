from pydantic import BaseModel, HttpUrl, field_validator
from datetime import datetime
from typing import Optional, Dict, Any

# What the API accepts from the client
class ScanRequest(BaseModel):
    url: str

    @field_validator('url')
    @classmethod
    def validate_url_structure(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(('http://', 'https://')):
            # Automatically prepend https:// if a user just enters "google.com"
            v = 'https://' + v
        
        if '.' not in v:
            raise ValueError('Invalid URL framework structure.')
        return v

# Individual Model Metrics Schema
class ModelBreakdown(BaseModel):
    cnn_score: float
    lstm_score: float

# What the API returns back to the client
class ScanResponse(BaseModel):
    id: int
    url: str
    is_phishing: bool
    confidence_score: float
    breakdown: ModelBreakdown
    attention_weights: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Represents a single summary item in a user's scan history list
class ScanHistoryItem(BaseModel):
    id: int
    url: str
    is_phishing: bool
    confidence_score: float
    created_at: datetime

    class Config:
        from_attributes = True