from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    
    # Combined Overall Prediction
    is_phishing = Column(Boolean, nullable=False)
    confidence_score = Column(Float, nullable=False)  # Overall system confidence (0.0 to 1.0)
    
    # Model Specific Breakdown
    cnn_prediction = Column(Float, nullable=False)    # Raw score from 1D CNN branch
    lstm_prediction = Column(Float, nullable=False)   # Raw score from BiLSTM branch
    
    # Explainable AI Data (Stores character indices and their attention scores)
    attention_weights = Column(JSON, nullable=True)   
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Establish an explicit relationship back to the User model
    user = relationship("User", back_populates="scans")