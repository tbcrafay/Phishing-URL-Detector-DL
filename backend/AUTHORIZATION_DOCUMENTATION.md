# User Authorization Architecture - Backend

## Overview
This document explains how user authorization works in the backend of the Phishing URL Detector system.

The authorization flow is based on:
- Google OAuth 2.0 for external user authentication
- FastAPI for the web API framework
- SQLAlchemy for ORM access to PostgreSQL
- Pydantic for request and response validation
- JWT tokens for session management

## Directory and File Structure

```
backend/
  .env
  requirements.txt
  AUTHORIZATION_DOCUMENTATION.md
  app/
    main.py
    api/
      auth.py
      detector.py
    core/
      config.py
      database.py
      security.py
    models/
      user.py
      scan.py
    schemas/
      user.py
      scan.py
```

### Key files for authorization
- `app/main.py` - Application entry point and router registration.
- `app/api/auth.py` - Google OAuth login callback and JWT creation.
- `app/core/security.py` - Token validation dependency used to protect endpoints.
- `app/core/config.py` - Central settings and environment variable loading.
- `app/core/database.py` - SQLAlchemy engine and database session management.
- `app/models/user.py` - User database model.
- `app/schemas/user.py` - Pydantic schemas for API responses and token payloads.

## Frameworks and Libraries Used

- `FastAPI` - Web framework for building async REST APIs.
- `SQLAlchemy` - ORM for mapping Python classes to database tables.
- `Pydantic` - Data validation and settings management.
- `python-jose` - JWT token encoding and decoding.
- `httpx` - Async HTTP client for calling Google OAuth endpoints.
- `fastapi.security.OAuth2PasswordBearer` - FastAPI helper for extracting `Bearer` tokens from requests.
- `uvicorn` (implied) - ASGI server used when running the FastAPI app.

## Config and Environment

### `app/core/config.py`
This file loads environment variables and centralizes security settings.

Important values:
- `SECRET_KEY` - used to sign JWT tokens.
- `ALGORITHM` - JWT algorithm, set to `HS256`.
- `ACCESS_TOKEN_EXPIRE_MINUTES` - token lifetime, default `60` minutes.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials for Google.
- `GOOGLE_REDIRECT_URI` - callback URL that Google returns users to.
- `DATABASE_URL` - PostgreSQL connection string.

The app reads `.env` when present, so secret credentials can stay out of source control.

## Database and ORM

### `app/core/database.py`
- Creates the SQLAlchemy engine using `settings.DATABASE_URL`.
- Creates `SessionLocal` for request-scoped DB sessions.
- Defines `Base` for ORM models.
- Provides `get_db()` dependency to yield a session and close it after each request.

### `app/models/user.py`
Defines the `User` table structure with columns:
- `id`: primary key
- `email`: unique, required
- `username`: unique, required
- `hashed_password`: optional, for future non-Google credential support
- `is_verified`: boolean to mark trusted accounts
- `created_at`: timestamp metadata

This model is the persistent record used for authorization and session identity.

## API Flow and Process

### 1. Google login entry point
File: `app/api/auth.py`

Endpoint: `GET /api/auth/google/login`

What it does:
- Builds Google OAuth authorization URL.
- Uses `GOOGLE_CLIENT_ID`, `GOOGLE_REDIRECT_URI`, and OAuth scopes.
- Redirects the browser to Google sign-in.

This is the first step of the authorization handshake.

### 2. Google callback and token exchange
Endpoint: `GET /api/auth/google/callback`

Purpose:
- Receive the authorization `code` from Google.
- Exchange the code for an access token from `https://oauth2.googleapis.com/token`.
- Request the user profile from `https://www.googleapis.com/oauth2/v2/userinfo`.
- Extract `email` and optionally `name`.

Step-by-step inside `google_callback`:
1. Validate the `code` query parameter.
2. POST to Google token endpoint with:
   - `client_id`
   - `client_secret`
   - `code`
   - `grant_type=authorization_code`
   - `redirect_uri`
3. If Google returns a token, call the userinfo endpoint.
4. Extract verified user data from Google.

### 3. Local user provisioning
After the Google profile is retrieved:
- Query the database for `User.email`.
- If the user exists, reuse the record.
- If not, create a new `User` with:
  - `email`
  - `username`
  - `hashed_password=None`
  - `is_verified=True`
- Commit the new user to PostgreSQL.

This means users can sign up automatically the first time they log in with Google.

### 4. JWT creation
The backend issues its own session token after Google login.

Function: `create_access_token(data: dict)`
- Adds an expiration timestamp to the payload.
- Signs it with `settings.SECRET_KEY` using `HS256`.
- Returns a string JWT.

Payload includes:
- `sub`: the user email
- `user_id`: the database user ID

### 5. API response
The callback returns a `TokenResponse` containing:
- `access_token`: the signed JWT
- `token_type`: `bearer`
- `user`: user object shaped by `UserResponse`

The `UserResponse` schema includes:
- `id`
- `email`
- `username`
- `is_verified`
- `created_at`

This response is ready for client-side session storage.

## Protecting Routes with JWT Validation

### `app/core/security.py`
This file defines a reusable FastAPI dependency:
- `oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/google/login")`
- `get_current_user()` validates incoming tokens.

How it works:
1. Extracts the `Authorization: Bearer <TOKEN>` header.
2. Decodes the JWT with `jose.jwt.decode()`.
3. Checks that `sub` and `user_id` exist.
4. Loads the matching `User` from the database.
5. Raises a `401 Unauthorized` if the token is invalid, expired, or the user does not exist.

Any protected endpoint can use:

```python
current_user: User = Depends(get_current_user)
```

That ensures only authenticated requests can reach the route.

## Application Integration

### `app/main.py`
- Imports `auth` and `detector` routers.
- Calls `Base.metadata.create_all(bind=engine)` to create missing tables automatically.
- Registers `auth.router` under `/api/auth`.
- Registers detector routes under `/api/detector`.

This is the central place that wires authorization to the full API.

## Data Flow Diagram

1. Browser / frontend requests `GET /api/auth/google/login`
2. Backend redirects to Google OAuth screen.
3. User authenticates with Google.
4. Google sends `code` to `/api/auth/google/callback`.
5. Backend exchanges code for Google access token.
6. Backend fetches Google profile data.
7. Backend finds or creates local `User` record.
8. Backend issues a signed JWT.
9. Frontend stores the JWT and includes it in future `Authorization: Bearer <token>` requests.
10. Protected endpoints validate the JWT using `get_current_user()`.

## How to Explain It Quickly

- The backend uses Google as the identity provider, but session control is handled locally.
- Google proves the user owns an email address.
- The backend stores that user in PostgreSQL once.
- A JWT is then created so the frontend can call protected APIs without re-authenticating to Google on every request.
- The `security` dependency reads the JWT, verifies it, and returns the authenticated user.

## Practical Notes

- `GOOGLE_REDIRECT_URI` must match the Google OAuth app settings exactly.
- The `SECRET_KEY` should be strong and kept secret.
- `DATABASE_URL` should point to a running PostgreSQL instance.
- `ACCESS_TOKEN_EXPIRE_MINUTES` controls how long a user session lasts.
- If you want password-based login later, add password hashing and a login endpoint alongside Google OAuth.

## Summary
This authorization layer is built as:
- `FastAPI` for API routing
- `Google OAuth` for authentication
- `JWT` for session tokens
- `SQLAlchemy` for storing users
- `Pydantic` for type-safe responses

The code is separated into:
- `api/` for routes,
- `core/` for security and database plumbing,
- `models/` for persistence,
- `schemas/` for API payload definitions.

Use this document to explain both the architectural design and the code-level process.
