"""
管理后台 API
超级管理员权限控制
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.models.database import get_db, User, UsageLog, ApiKey, Subscription
from app.api.auth import get_current_user_dependency
from app.services.rate_limit import RateLimitService

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# 检查是否管理员
def is_admin(user) -> bool:
    return user.email == "luckyhao0630@gmail.com" or user.plan == "enterprise"

def admin_required(current_user = Depends(get_current_user_dependency)):
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user

# 数据模型
class DashboardStats(BaseModel):
    total_users: int
    total_requests: int
    total_tokens_saved: int
    total_cost_saved: float
    avg_compression_ratio: float
    daily_requests: List[Dict[str, Any]]
    recent_users: List[Dict[str, Any]]
    top_users: List[Dict[str, Any]]

class UserDetail(BaseModel):
    id: int
    email: str
    name: Optional[str]
    plan: str
    created_at: datetime
    total_requests: int
    total_tokens_saved: int
    total_cost_saved: float

@router.get("/dashboard")
async def get_dashboard(
    admin = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """管理后台仪表盘数据"""
    
    # 总用户数
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # 总请求数
    total_requests = db.query(func.count(UsageLog.id)).scalar() or 0
    
    # 总token节省
    total_tokens_saved = db.query(func.sum(UsageLog.tokens_saved)).scalar() or 0
    
    # 总费用节省
    total_cost_saved = db.query(func.sum(UsageLog.cost_saved)).scalar() or 0.0
    
    # 平均压缩率
    avg_compression = db.query(func.avg(UsageLog.compression_ratio)).scalar() or 0.0
    
    # 最近7天每日请求
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_stats = db.query(
        func.date(UsageLog.created_at).label("date"),
        func.count(UsageLog.id).label("requests"),
        func.sum(UsageLog.tokens_saved).label("tokens_saved")
    ).filter(
        UsageLog.created_at >= seven_days_ago
    ).group_by(
        func.date(UsageLog.created_at)
    ).order_by(
        func.date(UsageLog.created_at)
    ).all()
    
    # 最近注册用户
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(10).all()
    
    # 用量最多的用户
    top_users = db.query(
        User.id,
        User.email,
        User.name,
        func.count(UsageLog.id).label("request_count"),
        func.sum(UsageLog.tokens_saved).label("tokens_saved")
    ).join(
        UsageLog, User.id == UsageLog.user_id
    ).group_by(
        User.id
    ).order_by(
        desc(func.count(UsageLog.id))
    ).limit(10).all()
    
    return {
        "total_users": total_users,
        "total_requests": total_requests,
        "total_tokens_saved": total_tokens_saved,
        "total_cost_saved": round(total_cost_saved, 4),
        "avg_compression_ratio": round(avg_compression * 100, 2),
        "daily_requests": [
            {
                "date": str(day.date),
                "requests": day.requests,
                "tokens_saved": day.tokens_saved or 0
            }
            for day in daily_stats
        ],
        "recent_users": [
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "plan": user.plan,
                "created_at": user.created_at.isoformat()
            }
            for user in recent_users
        ],
        "top_users": [
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "request_count": user.request_count,
                "tokens_saved": user.tokens_saved or 0
            }
            for user in top_users
        ]
    }

@router.get("/users")
async def list_users(
    admin = Depends(admin_required),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """用户列表"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        stats = db.query(
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.tokens_saved).label("tokens_saved"),
            func.sum(UsageLog.cost_saved).label("cost_saved")
        ).filter(UsageLog.user_id == user.id).first()
        
        result.append({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan": user.plan,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "total_requests": stats.requests or 0,
            "total_tokens_saved": stats.tokens_saved or 0,
            "total_cost_saved": round(stats.cost_saved or 0, 4)
        })
    
    return result

@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: int,
    admin = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """用户详情"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    stats = db.query(
        func.count(UsageLog.id).label("requests"),
        func.sum(UsageLog.tokens_saved).label("tokens_saved"),
        func.sum(UsageLog.cost_saved).label("cost_saved")
    ).filter(UsageLog.user_id == user_id).first()
    
    api_keys = db.query(ApiKey).filter(ApiKey.user_id == user_id).all()
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "plan": user.plan,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "total_requests": stats.requests or 0,
        "total_tokens_saved": stats.tokens_saved or 0,
        "total_cost_saved": round(stats.cost_saved or 0, 4),
        "api_keys": [
            {
                "id": key.id,
                "name": key.name,
                "key_prefix": key.key_prefix,
                "is_active": key.is_active,
                "created_at": key.created_at.isoformat()
            }
            for key in api_keys
        ]
    }

@router.get("/usage/stats")
async def get_usage_stats(
    admin = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """用量统计"""
    # 按天统计
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_stats = db.query(
        func.date(UsageLog.created_at).label("date"),
        func.count(UsageLog.id).label("requests"),
        func.sum(UsageLog.tokens_before).label("tokens_before"),
        func.sum(UsageLog.tokens_after).label("tokens_after"),
        func.sum(UsageLog.tokens_saved).label("tokens_saved"),
        func.sum(UsageLog.cost_saved).label("cost_saved")
    ).filter(
        UsageLog.created_at >= thirty_days_ago
    ).group_by(
        func.date(UsageLog.created_at)
    ).order_by(
        func.date(UsageLog.created_at)
    ).all()
    
    # 按内容类型统计
    content_types = db.query(
        UsageLog.model,
        func.count(UsageLog.id).label("count"),
        func.avg(UsageLog.compression_ratio).label("avg_ratio")
    ).group_by(
        UsageLog.model
    ).all()
    
    return {
        "daily_stats": [
            {
                "date": str(day.date),
                "requests": day.requests,
                "tokens_before": day.tokens_before or 0,
                "tokens_after": day.tokens_after or 0,
                "tokens_saved": day.tokens_saved or 0,
                "cost_saved": round(day.cost_saved or 0, 4)
            }
            for day in daily_stats
        ],
        "content_types": [
            {
                "model": ct.model,
                "count": ct.count,
                "avg_compression_ratio": round((ct.avg_ratio or 0) * 100, 2)
            }
            for ct in content_types
        ]
    }

@router.get("/me/usage")
async def get_admin_usage(
    admin = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """管理员自己的用量统计"""
    return await get_dashboard(admin, db)
