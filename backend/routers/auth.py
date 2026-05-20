import secrets
from typing import Optional
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from auth.jwt import create_access_token, get_current_user
from config import settings
from db.session import get_db
from models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

_GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
_GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
_GITHUB_USER_URL = "https://api.github.com/user"

_STATE_COOKIE = "oauth_state"


@router.get("/github")
async def github_login(response: Response):
    """Redirect the browser to GitHub's OAuth consent page."""
    state = secrets.token_urlsafe(16)
    params = urlencode(
        {
            "client_id": settings.github_client_id,
            "redirect_uri": settings.github_redirect_uri,
            "scope": "read:user",
            "state": state,
        }
    )
    redirect = RedirectResponse(url=f"{_GITHUB_AUTHORIZE_URL}?{params}")
    redirect.set_cookie(
        key=_STATE_COOKIE,
        value=state,
        max_age=300,
        samesite="none",
        secure=True,
    )
    return redirect


@router.get("/github/callback")
async def github_callback(
    code: str,
    state: str,
    oauth_state: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    """Exchange GitHub code for an access token, upsert user, redirect to frontend with JWT."""
    if not oauth_state or oauth_state != state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            _GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.github_redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_resp.raise_for_status()
        github_token = token_resp.json().get("access_token")
        if not github_token:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub did not return an access token",
            )

        user_resp = await client.get(
            _GITHUB_USER_URL,
            headers={"Authorization": f"Bearer {github_token}", "Accept": "application/json"},
        )
        user_resp.raise_for_status()
        gh = user_resp.json()

    github_id: int = gh["id"]
    username: str = gh["login"]
    display_name: Optional[str] = gh.get("name") or username
    avatar_url: Optional[str] = gh.get("avatar_url")

    user = db.query(User).filter(User.github_id == github_id).first()
    if user:
        user.username = username
        user.display_name = display_name
        user.avatar_url = avatar_url
    else:
        user = User(
            github_id=github_id,
            username=username,
            display_name=display_name,
            avatar_url=avatar_url,
        )
        db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)

    # Pass JWT to frontend via URL param — avoids cross-site cookie restrictions
    redirect = RedirectResponse(
        url=f"{settings.frontend_url}?token={token}",
        status_code=status.HTTP_302_FOUND,
    )
    redirect.delete_cookie(_STATE_COOKIE)
    return redirect


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "github_id": current_user.github_id,
        "username": current_user.username,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
    }


@router.get("/logout")
async def logout():
    """No-op — client clears the token from localStorage."""
    return {"ok": True}
