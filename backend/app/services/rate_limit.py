"""
限流与配额管理服务
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional

from app.models.database import User, ApiKey, UsageLog


# 套餐配置
PLAN_CONFIGS = {
    "free": {
        "daily_limit": 100,
        "monthly_limit": 3000,
        "max_tokens_per_request": 10000,
        "advanced_compression": False,
        "api_access": False,
        "team_seats": 1,
    },
    "pro": {
        "daily_limit": -1,  # 无限
        "monthly_limit": -1,
        "max_tokens_per_request": 50000,
        "advanced_compression": True,
        "api_access": True,
        "team_seats": 1,
    },
    "team": {
        "daily_limit": -1,
        "monthly_limit": -1,
        "max_tokens_per_request": 100000,
        "advanced_compression": True,
        "api_access": True,
        "team_seats": 5,
    },
    "enterprise": {
        "daily_limit": -1,
        "monthly_limit": -1,
        "max_tokens_per_request": 500000,
        "advanced_compression": True,
        "api_access": True,
        "team_seats": -1,  # 无限
    },
}


class RateLimitExceeded(Exception):
    """配额超限异常"""
    def __init__(self, message: str, limit_type: str, current: int, limit: int):
        self.message = message
        self.limit_type = limit_type
        self.current = current
        self.limit = limit
        super().__init__(message)


class RateLimitService:
    """限流服务"""
    
    @staticmethod
    def get_plan_config(plan: str) -> dict:
        """获取套餐配置"""
        return PLAN_CONFIGS.get(plan, PLAN_CONFIGS["free"])
    
    @staticmethod
    def check_daily_limit(db: Session, user_id: int, api_key_id: Optional[int] = None) -> dict:
        """检查今日用量是否超限"""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 查询今日用量
        today_count = db.query(func.count(UsageLog.id)).filter(
            and_(
                UsageLog.user_id == user_id,
                UsageLog.created_at >= today,
                UsageLog.status == "success"
            )
        ).scalar() or 0
        
        # 获取限制
        daily_limit = None
        if api_key_id:
            api_key = db.query(ApiKey).filter(ApiKey.id == api_key_id).first()
            if api_key and api_key.daily_limit is not None:
                daily_limit = api_key.daily_limit
        
        if daily_limit is None:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                daily_limit = user.daily_limit or 100
        
        return {
            "current": today_count,
            "limit": daily_limit,
            "remaining": max(0, daily_limit - today_count) if daily_limit > 0 else -1,
            "exceeded": daily_limit > 0 and today_count >= daily_limit,
        }
    
    @staticmethod
    def check_monthly_limit(db: Session, user_id: int) -> dict:
        """检查本月用量"""
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        month_count = db.query(func.count(UsageLog.id)).filter(
            and_(
                UsageLog.user_id == user_id,
                UsageLog.created_at >= month_start,
                UsageLog.status == "success"
            )
        ).scalar() or 0
        
        user = db.query(User).filter(User.id == user_id).first()
        monthly_limit = user.monthly_limit if user else 3000
        
        return {
            "current": month_count,
            "limit": monthly_limit,
            "remaining": max(0, monthly_limit - month_count) if monthly_limit > 0 else -1,
            "exceeded": monthly_limit > 0 and month_count >= monthly_limit,
        }
    
    @staticmethod
    def check_limits(db: Session, user_id: int, api_key_id: Optional[int] = None, tokens_count: int = 0) -> dict:
        """
        综合检查所有配额
        返回配额状态，超限则抛出异常
        """
        # 检查日限
        daily = RateLimitService.check_daily_limit(db, user_id, api_key_id)
        if daily["exceeded"]:
            raise RateLimitExceeded(
                f"Daily limit exceeded: {daily['current']}/{daily['limit']}",
                "daily", daily["current"], daily["limit"]
            )
        
        # 检查月限
        monthly = RateLimitService.check_monthly_limit(db, user_id)
        if monthly["exceeded"]:
            raise RateLimitExceeded(
                f"Monthly limit exceeded: {monthly['current']}/{monthly['limit']}",
                "monthly", monthly["current"], monthly["limit"]
            )
        
        # 获取用户套餐
        user = db.query(User).filter(User.id == user_id).first()
        plan_config = RateLimitService.get_plan_config(user.plan if user else "free")
        
        # 检查单请求token限制
        if plan_config["max_tokens_per_request"] > 0 and tokens_count > plan_config["max_tokens_per_request"]:
            raise RateLimitExceeded(
                f"Request too large: {tokens_count} tokens (max: {plan_config['max_tokens_per_request']})",
                "request_size", tokens_count, plan_config["max_tokens_per_request"]
            )
        
        # 检查API访问权限
        if api_key_id and not plan_config["api_access"]:
            raise RateLimitExceeded(
                "API access requires Pro plan or higher",
                "api_access", 0, 0
            )
        
        return {
            "daily": daily,
            "monthly": monthly,
            "plan": user.plan if user else "free",
            "plan_config": plan_config,
        }
    
    @staticmethod
    def get_usage_summary(db: Session, user_id: int) -> dict:
        """获取用户用量摘要"""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        daily_stats = RateLimitService.check_daily_limit(db, user_id)
        monthly_stats = RateLimitService.check_monthly_limit(db, user_id)
        
        # 获取用户
        user = db.query(User).filter(User.id == user_id).first()
        
        # 总token节省
        total_saved = db.query(func.sum(UsageLog.tokens_saved)).filter(
            UsageLog.user_id == user_id,
            UsageLog.status == "success"
        ).scalar() or 0
        
        total_cost_saved = db.query(func.sum(UsageLog.cost_saved)).filter(
            UsageLog.user_id == user_id,
            UsageLog.status == "success"
        ).scalar() or 0.0
        
        return {
            "daily": daily_stats,
            "monthly": monthly_stats,
            "total_tokens_saved": total_saved,
            "total_cost_saved": round(total_cost_saved, 4),
            "plan": user.plan if user else "free",
        }
