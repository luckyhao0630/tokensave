from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tokensaver.db")

# 根据URL选择引擎
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    oauth_provider = Column(String(50), nullable=True)  # github, google
    oauth_id = Column(String(255), nullable=True)
    
    # 用户信息
    name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # 账户状态
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    plan = Column(String(50), default="free")  # free, pro, team, enterprise
    
    # 配额
    daily_limit = Column(Integer, default=100)  # 每日请求限制
    monthly_limit = Column(Integer, default=3000)  # 每月请求限制
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # 关系
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    usage_logs = relationship("UsageLog", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Key信息
    name = Column(String(100), default="Default")
    key_hash = Column(String(255), unique=True, index=True, nullable=False)
    key_prefix = Column(String(10), nullable=False)  # 用于显示的前缀，如 "ts_live_"
    
    # 状态
    is_active = Column(Boolean, default=True)
    
    # 配额（覆盖用户级别）
    daily_limit = Column(Integer, nullable=True)
    monthly_limit = Column(Integer, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="api_keys")
    usage_logs = relationship("UsageLog", back_populates="api_key")

class UsageLog(Base):
    __tablename__ = "usage_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=True)
    
    # 请求信息
    request_type = Column(String(50), nullable=False)  # compress, proxy
    model = Column(String(100), nullable=True)
    
    # Token统计
    tokens_before = Column(BigInteger, default=0)
    tokens_after = Column(BigInteger, default=0)
    tokens_saved = Column(BigInteger, default=0)
    compression_ratio = Column(Float, default=0.0)
    
    # 费用计算
    cost_before = Column(Float, default=0.0)
    cost_after = Column(Float, default=0.0)
    cost_saved = Column(Float, default=0.0)
    
    # 处理信息
    processing_time_ms = Column(Integer, nullable=True)
    transforms_applied = Column(Text, nullable=True)  # JSON数组
    
    # 状态
    status = Column(String(50), default="success")  # success, error, cached
    error_message = Column(Text, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="usage_logs")
    api_key = relationship("ApiKey", back_populates="usage_logs")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 计划信息
    plan = Column(String(50), nullable=False)  # pro, team, enterprise
    interval = Column(String(20), default="monthly")  # monthly, yearly
    
    # 支付信息
    payment_provider = Column(String(50), default="stripe")  # stripe, wechat, alipay
    payment_status = Column(String(50), default="active")  # active, canceled, past_due
    
    # Stripe信息
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_price_id = Column(String(255), nullable=True)
    
    # 时间
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="subscriptions")

class DailyStats(Base):
    __tablename__ = "daily_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, unique=True, index=True, nullable=False)
    
    # 总体统计
    total_requests = Column(BigInteger, default=0)
    total_tokens_before = Column(BigInteger, default=0)
    total_tokens_after = Column(BigInteger, default=0)
    total_tokens_saved = Column(BigInteger, default=0)
    total_cost_saved = Column(Float, default=0.0)
    
    # 用户统计
    active_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    
    # 平均压缩率
    avg_compression_ratio = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 创建表
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
