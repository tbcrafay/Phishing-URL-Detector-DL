# URL Scanner Implementation - Backend

## Overview
This document explains how the URL scanner is implemented in the backend of the Phishing URL Detector system.

The scanner is responsible for:
- receiving user-submitted URLs
- validating and normalizing their structure
- analyzing the URL through a predictive inference engine
- saving scan history to the database
- returning threat results and model explainability data

## Directory and File Structure

```
backend/
  app/
    api/
      detector.py
    core/
      database.py
      security.py
    dl_inference/
      predictor.py
    models/
      scan.py
      user.py
    schemas/
      scan.py
      user.py
```

### Key files for scanning
- `app/api/detector.py` - scanning routes and request lifecycle.
- `app/dl_inference/predictor.py` - URL analysis inference engine.
- `app/models/scan.py` - persistence model for scan records.
- `app/schemas/scan.py` - request/response validation and serialization.
- `app/core/database.py` - session handling and database connection.
- `app/core/security.py` - user authentication dependency protecting scanner access.

## Frameworks and Libraries Used

- `FastAPI` - HTTP routing and async API handling.
- `SQLAlchemy` - ORM for database models and transactions.
- `Pydantic` - schema validation for request/response payloads.
- `httpx` - used elsewhere for OAuth calls, not directly in scanning.
- `random` - used in the mock predictor to generate example prediction scores.

## Scanner API Flow

### Endpoint: `POST /api/detector/scan`
Request payload: `ScanRequest`

The scanner route life cycle:
1. The client sends a URL inside `ScanRequest`.
2. FastAPI validates the request using `app/schemas/scan.py`.
3. The route requires an authenticated user with `Depends(get_current_user)`.
4. The normalized URL is passed to `url_predictor.analyze_textual_url()`.
5. The returned analysis dictionary is persisted to the `scans` table.
6. A `ScanResponse` object is returned to the client.

### Endpoint: `GET /api/detector/history`
The history endpoint returns the authenticated user's past scans.
- Fetches rows from the `scans` table filtered by `current_user.id`
- Orders results by `created_at` descending
- Returns a list of `ScanHistoryItem`

## Request and Response Schemas

### `app/schemas/scan.py`

`ScanRequest`:
- Accepts `url: str`
- Validates the URL structure using `field_validator`
- Automatically prepends `https://` when missing
- Requires a dot `.` to pass basic URL structure validation

`ModelBreakdown`:
- Contains per-model scores:
  - `cnn_score`
  - `lstm_score`

`ScanResponse`:
- Includes the scan database ID, URL, phishing flag, confidence score, breakdown, attention weights, and timestamp.

`ScanHistoryItem`:
- Returns summarized historical scan data to reduce response size.

## Database Model

### `app/models/scan.py`

Columns in the `scans` table:
- `id` - integer primary key
- `user_id` - foreign key to `users.id`
- `url` - original scanned URL
- `is_phishing` - final binary decision
- `confidence_score` - averaged confidence from two model branches
- `cnn_prediction` - 1D CNN score
- `lstm_prediction` - BiLSTM score
- `attention_weights` - JSON explainability payload
- `created_at` - timestamp of scan creation

Relationships:
- `user` relationship back to the `User` object
- `User.scans` in `app/models/user.py` links scan history to each user

## Inference Engine

### `app/dl_inference/predictor.py`

The backend currently uses a mock inference class named `URLPredictor`.
This is a placeholder for the actual deep learning model logic.

Key responsibilities:
- Analyze the URL string and compute scores.
- Produce an overall phishing decision.
- Generate explainability `attention_weights` for each character.

How `analyze_textual_url()` works:
1. Normalizes the URL to lowercase.
2. Checks heuristics for phishing features:
   - suspicious keywords like `login`, `verify`, `banking`, `paypal`
   - numeric IP-like domains
   - excessive subdomains
3. If suspicious features exist, the function simulates high phishing scores.
4. Otherwise, it simulates low safe scores.
5. Computes an overall `confidence_score` as the mean of `cnn_score` and `lstm_score`.
6. Sets `is_phishing` to `True` when confidence is `>= 0.50`.
7. Builds a character-level `attention_map` to support explainability.

The exported singleton instance is:
- `url_predictor = URLPredictor()`

## Data Flow Diagram

1. Authenticated user submits `POST /api/detector/scan` with a URL.
2. FastAPI validates the input through Pydantic.
3. `get_current_user` ensures the request is from a signed-in user.
4. `url_predictor.analyze_textual_url(url)` returns:
   - `is_phishing`
   - `confidence_score`
   - `cnn_score`
   - `lstm_score`
   - `attention_weights`
5. A new `Scan` row is created and saved in PostgreSQL.
6. The API responds with `ScanResponse`.
7. Later, the user can retrieve history via `GET /api/detector/history`.

## How the Scan Service Connects to Authorization

- `scan_textual_url()` is protected by `current_user: User = Depends(get_current_user)`.
- The user identity is derived from the JWT issued by the auth module.
- Every scan record stores `user_id`, enabling per-user history and auditability.
- This means only authenticated users can launch scans and see their own results.

## Practical Notes

- The current predictor is a mock and can be replaced by a real model loading pipeline.
- The `attention_weights` JSON column is well-suited for UI highlight visualizations.
- The `ScanRequest` validator ensures only structurally valid URLs reach the inference layer.
- The separation between `api/`, `dl_inference/`, `schemas/`, and `models/` makes the design modular.

## Extension Points

Future enhancements may include:
- loading an actual trained 1D CNN + BiLSTM model
- tokenization and padded sequence input preprocessing
- storing raw model logits and probability distributions
- using a separate `ScanService` class for cleaner business logic
- adding batch scanning endpoints or URL reputation lookups

## Summary
The scanner implementation is a secure, modular service that:
- validates URL input,
- authenticates the caller,
- runs inference in `dl_inference/predictor.py`,
- saves results as `Scan` records,
- returns structured scan responses,
- and supports per-user scan history.

This document describes both the code-level implementation and the end-to-end data flow.
