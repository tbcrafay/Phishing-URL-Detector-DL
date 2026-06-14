from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from jose import jwt
import httpx
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import TokenResponse

router = APIRouter()

# Helper function to generate local backend JWTs
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.get("/google/login")
async def google_login():
    """
    Step 1: Point your browser here. It builds the Google URL 
    and redirects the client to Google's sign-in screen.
    """
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"prompt=select_account"
    )
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Step 2: Google redirects here with an authorization code. 
    We exchange it for profile info and issue our custom access JWT.
    """
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code missing from Google")

    # 1. Exchange authorization code for an identity access token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET.get_secret_value(),
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)

    # If Google returned a non-200, include response text in logs for diagnostics
    if token_response.status_code != 200:
        # print for console; uvicorn will capture this in logs
        print('Google token exchange failed:', token_response.status_code, token_response.text)
        raise HTTPException(status_code=400, detail="Failed to retrieve token from Google exchange")

    tokens = token_response.json()
    access_token = tokens.get("access_token")

    # 2. Use the retrieved access token to fetch the user's verified profile data
    userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(userinfo_url, headers=headers)
        
    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user profiles from Google")
        
    user_info = userinfo_response.json()
    email = user_info.get("email")
    name = user_info.get("name", email.split("@")[0])  # Fallback to email prefix if name is blank

    if not email:
        raise HTTPException(status_code=400, detail="Google account did not provide a valid email address")

    # 3. Process the account within our PostgreSQL user tables
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Sign-up: Account doesn't exist, create it seamlessly
        user = User(
            email=email,
            username=name.replace(" ", "_").lower(),  # Format username cleanly
            hashed_password=None,                     # No password required for Google logins
            is_verified=True                          # Google verified this email address already
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. Generate our app's own security JWT payload for session management
    jwt_token = create_access_token(data={"sub": user.email, "user_id": user.id})

    frontend_callback_url = f"http://localhost:5173/auth/callback?token={jwt_token}"
    
    return RedirectResponse(url=frontend_callback_url)