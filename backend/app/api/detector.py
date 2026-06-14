from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanRequest, ScanResponse, ModelBreakdown, ScanHistoryItem
from app.dl_inference.predictor import url_predictor

router = APIRouter()

@router.post("/scan", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def scan_textual_url(
    payload: ScanRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Protected URL Threat Scanning Gateway.
    Processes strings through the 1D CNN and BiLSTM neural layers.
    """
    # 1. Forward structural input context directly to the inference predictor engine
    analysis = url_predictor.analyze_textual_url(payload.url)
    
    # 2. Build and save the concrete database transaction log linked to the scanning user
    new_scan = Scan(
        user_id=current_user.id,
        url=payload.url,
        is_phishing=analysis["is_phishing"],
        confidence_score=analysis["confidence_score"],
        cnn_prediction=analysis["cnn_score"],
        lstm_prediction=analysis["lstm_score"],
        attention_weights=analysis["attention_weights"]
    )
    
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
    
    # Secure attention weights decoding logic for clean JSON formatting
    weights_payload = new_scan.attention_weights
    if isinstance(weights_payload, str):
        try:
            weights_payload = json.loads(weights_payload)
        except Exception:
            pass

    # 3. Format database outputs cleanly to fit our Pydantic serializations
    return ScanResponse(
        id=new_scan.id,
        url=new_scan.url,
        is_phishing=new_scan.is_phishing,
        confidence_score=new_scan.confidence_score,
        breakdown=ModelBreakdown(
            cnn_score=new_scan.cnn_prediction,
            lstm_score=new_scan.lstm_prediction
        ),
        attention_weights=weights_payload,
        created_at=new_scan.created_at
    )

@router.delete("/history/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan_entry(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a specific scan log entry from historical records.
    """
    scan_log = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    
    if not scan_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested intelligence record not found or unauthorized access."
        )
        
    db.delete(scan_log)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/history", response_model=List[ScanHistoryItem])
async def get_scan_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve Scan History.
    Fetches all historical threat scans completed by the authenticated user,
    sorted by the most recent execution timestamp.
    """
    # CRITICAL FIX: Explicitly filter by current_user.id so users don't see each other's data
    history = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.created_at.desc()).all()
    return history