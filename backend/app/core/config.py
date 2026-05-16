import os
from pydantic import SecretStr
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Phishing URL Detector System"
    
    # Security Configurations
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Google OAuth Credentials
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: SecretStr
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    
    # Database Configuration (We'll update this once your local PostgreSQL is linked)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/phishing_db")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()