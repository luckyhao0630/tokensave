"""
OAuth 登录支持（GitHub/Google）
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import requests
import os

from app.models.database import get_db, User
from app.services.auth import create_access_token, create_refresh_token, create_user, get_user_by_email, get_password_hash

router = APIRouter(prefix="/api/v1/oauth", tags=["oauth"])

# GitHub OAuth 配置
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = "https://tokesave.com/api/v1/oauth/github/callback"

# Google OAuth 配置
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = "https://tokesave.com/api/v1/oauth/google/callback"

@router.get("/github")
async def github_login():
    """GitHub OAuth 登录入口"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth 未配置")
    
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "scope": "user:email",
        "state": "github_oauth_state",
    }
    query = "&".join([f"{k}={v}" for k, v in params.items()])
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{query}")

@router.get("/github/callback")
async def github_callback(code: str, state: str, db: Session = Depends(get_db)):
    """GitHub OAuth 回调"""
    # 获取 access token
    token_resp = requests.post("https://github.com/login/oauth/access_token", headers={
        "Accept": "application/json"
    }, data={
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI,
    })
    
    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        raise HTTPException(status_code=400, detail="GitHub OAuth 失败")
    
    # 获取用户信息
    user_resp = requests.get("https://api.github.com/user", headers={
        "Authorization": f"token {access_token}",
        "Accept": "application/json"
    })
    
    user_data = user_resp.json()
    email = user_data.get("email")
    name = user_data.get("name", "")
    
    if not email:
        # 获取邮箱列表
        emails_resp = requests.get("https://api.github.com/user/emails", headers={
            "Authorization": f"token {access_token}",
            "Accept": "application/json"
        })
        emails = emails_resp.json()
        for e in emails:
            if e.get("primary"):
                email = e.get("email")
                break
        if not email and emails:
            email = emails[0].get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="无法获取 GitHub 邮箱")
    
    # 查找或创建用户
    user = get_user_by_email(db, email)
    if not user:
        # 创建新用户
        random_password = os.urandom(32).hex()
        user = create_user(db, email=email, password=random_password)
        if name:
            user.name = name
            db.commit()
    
    # 生成 Token
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # 重定向到前端，带 token
    return RedirectResponse(f"https://tokesave.com/login?token={access_token}&refresh={refresh_token}")

@router.get("/google")
async def google_login():
    """Google OAuth 登录入口"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth 未配置")
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": "google_oauth_state",
    }
    query = "&".join([f"{k}={v}" for k, v in params.items()])
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")

@router.get("/google/callback")
async def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    """Google OAuth 回调"""
    # 获取 access token
    token_resp = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    })
    
    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        raise HTTPException(status_code=400, detail="Google OAuth 失败")
    
    # 获取用户信息
    user_resp = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={
        "Authorization": f"Bearer {access_token}",
    })
    
    user_data = user_resp.json()
    email = user_data.get("email")
    name = user_data.get("name", "")
    
    if not email:
        raise HTTPException(status_code=400, detail="无法获取 Google 邮箱")
    
    # 查找或创建用户
    user = get_user_by_email(db, email)
    if not user:
        random_password = os.urandom(32).hex()
        user = create_user(db, email=email, password=random_password)
        if name:
            user.name = name
            db.commit()
    
    # 生成 Token
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # 重定向到前端，带 token
    return RedirectResponse(f"https://tokesave.com/login?token={access_token}&refresh={refresh_token}")
