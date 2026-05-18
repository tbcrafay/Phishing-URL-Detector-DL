from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, detector
# Ensure all ORM model modules are imported so SQLAlchemy registers their tables
from app.models import user, scan

# Automatically create all tables in PostgreSQL if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API Gateway for Deep Learning Phishing URL Detection"
)

# Set up CORS so your vanilla JS frontend or Postman can talk to it cleanly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific local ports later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the Authentication router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(detector.router, prefix="/api/detector", tags=["Threat Detection"]) # ADD THIS LINE

@app.get("/")
def read_root():
    return {"status": "online", "message": "Phishing Detector API Gateway running smoothly"}