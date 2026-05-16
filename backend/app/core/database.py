from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create database engine
engine = create_engine(settings.DATABASE_URL)

# Create a thread-localized session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database tables
Base = declarative_base()

# Dependency utility to get DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()