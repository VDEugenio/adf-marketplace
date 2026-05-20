from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from db.session import get_db
from models.agent import Agent
from models.user import User
from schemas.user import UserProfile

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{username}", response_model=UserProfile)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    agents = (
        db.query(Agent)
        .options(joinedload(Agent.uploader))
        .filter(Agent.uploader_id == user.id)
        .order_by(Agent.created_at.desc())
        .all()
    )

    return UserProfile(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        agents=agents,
        total_downloads=sum(a.download_count for a in agents),
    )
