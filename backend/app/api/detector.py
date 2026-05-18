from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

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
        attention_weights=new_scan.attention_weights,
        created_at=new_scan.created_at
    )

 # Update this import line

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
    # Query the database for scans belonging exclusively to the current user
    user_scans = db.query(Scan)\
                   .filter(Scan.user_id == current_user.id)\
                   .order_by(Scan.created_at.desc())\
                   .all()
    
    return user_scans