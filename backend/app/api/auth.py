from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.models.database import get_db, User, ApiKey
from app.services.auth import (
    create_access_token, create_refresh_token, verify_token,
    create_user, authenticate_user, get_current_user, verify_api_key,
    create_api_key, get_user_by_email
)

router = APIRouter(prefix="/api/v1", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# 请求模型
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    plan: str
    created_at: datetime

class ApiKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]

class ApiKeyCreateResponse(BaseModel):
    api_key: str
    id: int
    name: str
    created_at: datetime

# 依赖函数
async def get_current_user_dependency(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_current_user(db, token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_api_key_user(x_api_key: str = Header(None, alias="X-API-Key"), db: Session = Depends(get_db)):
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="缺少 API Key",
        )
    api_key = verify_api_key(db, x_api_key)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的 API Key",
        )
    return api_key.user

# 用户注册
@router.post("/auth/register", response_model=UserResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # 检查邮箱是否已存在
    existing_user = get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )
    
    user = create_user(db, email=request.email, password=request.password)
    return user

# 登录请求模型（JSON）
class LoginRequest(BaseModel):
    email: str
    password: str

# 用户登录 - 支持 OAuth2 表单和 JSON 两种方式
@router.post("/auth/login")
async def login(
    request: LoginRequest = None,
    form_data: OAuth2PasswordRequestForm = None,
    db: Session = Depends(get_db)
):
    # 优先尝试 JSON 方式
    if request:
        email = request.email
        password = request.password
    elif form_data:
        email = form_data.username
        password = form_data.password
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供 email 和 password 字段"
        )
    
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan": user.plan,
        }
    }

# 刷新Token
@router.post("/auth/refresh")
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = verify_token(refresh_token, token_type="refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新Token"
        )
    
    email = payload.get("sub")
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    
    new_access_token = create_access_token(data={"sub": user.email})
    return {"access_token": new_access_token, "token_type": "bearer"}

# 获取当前用户信息
@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user_dependency)):
    return current_user

# API Key管理
@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def list_api_keys(current_user: User = Depends(get_current_user_dependency), db: Session = Depends(get_db)):
    api_keys = db.query(ApiKey).filter(ApiKey.user_id == current_user.id).all()
    return api_keys

@router.post("/api-keys", response_model=ApiKeyCreateResponse)
async def create_new_api_key(name: str = "New Key", current_user: User = Depends(get_current_user_dependency), db: Session = Depends(get_db)):
    raw_key, api_key = create_api_key(db, current_user.id, name)
    return {
        "api_key": raw_key,
        "id": api_key.id,
        "name": api_key.name,
        "created_at": api_key.created_at,
    }

@router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: int, current_user: User = Depends(get_current_user_dependency), db: Session = Depends(get_db)):
    api_key = db.query(ApiKey).filter(ApiKey.id == key_id, ApiKey.user_id == current_user.id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Key 不存在")
    
    api_key.is_active = False
    db.commit()
    return {"message": "API Key 已删除"}

# 更新用户信息
class UpdateUserRequest(BaseModel):
    name: Optional[str] = None

@router.put("/auth/me")
async def update_me(
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    if request.name is not None:
        current_user.name = request.name
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "plan": current_user.plan,
        "created_at": current_user.created_at,
    }

# 修改密码
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/auth/password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """修改密码"""
    from app.services.auth import verify_password, get_password_hash
    
    if not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="OAuth用户无法修改密码")
    
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="当前密码错误")
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    return {"message": "密码修改成功"}
