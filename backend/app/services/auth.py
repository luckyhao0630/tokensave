from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from app.models.database import User, ApiKey, get_db
import secrets
import hashlib
import os

# 配置
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password, hashed_password):
    password_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))

def get_password_hash(password):
    password_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access"):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None

def generate_api_key():
    """生成API Key"""
    raw_key = "ts_" + secrets.token_urlsafe(32)
    return raw_key

def hash_api_key(raw_key: str):
    """对API Key进行哈希存储"""
    return hashlib.sha256(raw_key.encode()).hexdigest()

def get_key_prefix(raw_key: str):
    """获取Key前缀用于显示"""
    return raw_key[:8] + "..." + raw_key[-4:]

def create_user(db: Session, email: str, password: str = None, oauth_provider: str = None, oauth_id: str = None):
    """创建用户"""
    hashed_password = None
    if password:
        hashed_password = get_password_hash(password)
    
    user = User(
        email=email,
        hashed_password=hashed_password,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 创建默认API Key
    create_api_key(db, user.id, "Default")
    
    return user

def create_api_key(db: Session, user_id: int, name: str = "Default"):
    """创建API Key"""
    raw_key = generate_api_key()
    key_hash = hash_api_key(raw_key)
    key_prefix = get_key_prefix(raw_key)
    
    api_key = ApiKey(
        user_id=user_id,
        name=name,
        key_hash=key_hash,
        key_prefix=key_prefix,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    # 返回原始key（仅创建时返回一次）
    return raw_key, api_key

def authenticate_user(db: Session, email: str, password: str):
    """用户登录验证"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not user.hashed_password:
        return None  # OAuth用户不能用密码登录
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_user_by_email(db: Session, email: str):
    """通过邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_oauth(db: Session, provider: str, oauth_id: str):
    """通过OAuth获取用户"""
    return db.query(User).filter(
        User.oauth_provider == provider,
        User.oauth_id == oauth_id
    ).first()

def get_current_user(db: Session, token: str):
    """通过JWT Token获取当前用户"""
    payload = verify_token(token)
    if payload is None:
        return None
    
    email = payload.get("sub")
    if email is None:
        return None
    
    user = get_user_by_email(db, email)
    return user

def verify_api_key(db: Session, raw_key: str):
    """验证API Key"""
    key_hash = hash_api_key(raw_key)
    api_key = db.query(ApiKey).filter(
        ApiKey.key_hash == key_hash,
        ApiKey.is_active == True
    ).first()
    
    if api_key:
        # 更新最后使用时间
        api_key.last_used_at = datetime.utcnow()
        db.commit()
    
    return api_key
