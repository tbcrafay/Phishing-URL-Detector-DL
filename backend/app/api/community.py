# app/api/community.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import re

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.community import Post
from app.schemas.community import PostCreate, PostUpdate, PostResponse

router = APIRouter()

def defang_links(text: str) -> str:
    """
    Security Gate: Neutralizes URLs so they don't become clickable links.
    Converts 'http://malicious.com' to 'http[://]malicious[.]com'
    """
    # Replacing dots in potential domains and breaking protocol hooks
    text = re.sub(r'(https?://)', r'http[://]', text, flags=re.IGNORECASE)
    text = re.sub(r'(www\.)', r'www[.]', text, flags=re.IGNORECASE)
    return text


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(payload: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new community thread with defanged text protocols."""
    safe_content = defang_links(payload.content)
    
    new_post = Post(user_id=current_user.id, content=safe_content)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@router.get("/", response_model=List[PostResponse])
async def get_global_feed(db: Session = Depends(get_db)):
    """Fetch all community posts for the global intelligence feed."""
    return db.query(Post).order_by(Post.created_at.desc()).all()


@router.get("/my-posts", response_model=List[PostResponse])
async def get_user_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve personal operational post logs for management."""
    return db.query(Post).filter(Post.user_id == current_user.id).order_by(Post.created_at.desc()).all()


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Modify an existing thread entry with ownership authorization checks."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    # Ownership Validation Guard
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Action unauthorized. Token identity mismatch.")
        
    post.content = defang_links(payload.content)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Purge a thread completely from the structural state."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
        
    # Ownership Validation Guard
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Action unauthorized. Token identity mismatch.")
        
    db.delete(post)
    db.commit()
    return None