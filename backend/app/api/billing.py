from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.models.database import get_db, User, Subscription
from app.api.auth import get_current_user_dependency
from app.services.paddle import PaddleService, PADDLE_PRICE_IDS
from app.services.rate_limit import RateLimitService

router = APIRouter(prefix="/api/v1", tags=["billing"])


# 请求模型
class CreateCheckoutRequest(BaseModel):
    plan: str  # pro, team, enterprise
    interval: str = "monthly"  # monthly, yearly
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class UpdatePlanRequest(BaseModel):
    plan: str


# 套餐信息API
@router.get("/plans")
async def get_plans():
    """获取所有套餐信息"""
    plans = {
        "free": {
            "name": "免费版",
            "price": 0,
            "price_usd": 0,
            "daily_limit": 100,
            "monthly_limit": 3000,
            "max_tokens_per_request": 10000,
            "api_access": False,
            "team_seats": 1,
            "features": [
                "基础压缩（JSON/日志/文本）",
                "每日100次请求",
                "网页端使用",
                "标准支持",
            ],
        },
        "pro": {
            "name": "专业版",
            "price": 19,  # USD
            "price_usd": 19,
            "daily_limit": -1,
            "monthly_limit": -1,
            "max_tokens_per_request": 50000,
            "api_access": True,
            "team_seats": 1,
            "features": [
                "高级压缩（代码/HTML/CSV）",
                "无限次请求",
                "API Key访问",
                "7天免费试用",
                "优先支持",
            ],
            "stripe_price_ids": {
                "monthly": PADDLE_PRICE_IDS.get("pro_monthly", ""),
                "yearly": PADDLE_PRICE_IDS.get("pro_yearly", ""),
            },
        },
        "team": {
            "name": "团队版",
            "price": 99,  # USD
            "price_usd": 99,
            "daily_limit": -1,
            "monthly_limit": -1,
            "max_tokens_per_request": 100000,
            "api_access": True,
            "team_seats": 5,
            "features": [
                "团队管理（5人）",
                "用量统计看板",
                "团队API Key",
                "高级分析报表",
                "专属支持",
            ],
            "paddle_price_ids": {
                "monthly": PADDLE_PRICE_IDS.get("team_monthly", ""),
                "yearly": PADDLE_PRICE_IDS.get("team_yearly", ""),
            },
        },
        "enterprise": {
            "name": "企业版",
            "price": 499,  # USD 起
            "price_usd": 499,
            "daily_limit": -1,
            "monthly_limit": -1,
            "max_tokens_per_request": 500000,
            "api_access": True,
            "team_seats": -1,
            "features": [
                "无限成员",
                "私有部署选项",
                "SLA保障",
                "专属客户经理",
                "定制集成",
            ],
            "paddle_price_ids": {
                "monthly": PADDLE_PRICE_IDS.get("enterprise_monthly", ""),
                "yearly": PADDLE_PRICE_IDS.get("enterprise_yearly", ""),
            },
        },
    }
    return {"plans": plans, "currency": "USD"}


# 限时免费活动配置（后端控制开关）
PROMO_CONFIG = {
    "enabled": True,  # 活动开关
    "name": "🎉 限时免费活动",
    "description": "所有用户免费体验 Pro 版全部功能",
    "free_features": ["pro", "team"],  # 限时开放的套餐
    "max_users": 1000,  # 名额限制
    "current_users": 0,  # 当前参与人数（实际应从数据库查询）
    "start_date": "2026-06-08",
    "end_date": "2026-07-08",  # 30天后结束
    "message": "限时免费体验中，所有功能全部开放！"
}


@router.get("/promo")
async def get_promo_status():
    """获取限时免费活动状态"""
    # 检查是否达到名额限制
    remaining = max(0, PROMO_CONFIG["max_users"] - PROMO_CONFIG["current_users"])
    
    return {
        "enabled": PROMO_CONFIG["enabled"] and remaining > 0,
        "name": PROMO_CONFIG["name"],
        "description": PROMO_CONFIG["description"],
        "message": PROMO_CONFIG["message"],
        "max_users": PROMO_CONFIG["max_users"],
        "remaining_slots": remaining,
        "start_date": PROMO_CONFIG["start_date"],
        "end_date": PROMO_CONFIG["end_date"],
        "all_features_free": True,
    }
async def get_current_plan(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """获取当前用户套餐"""
    plan_config = RateLimitService.get_plan_config(current_user.plan)
    
    # 获取订阅信息
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.payment_status == "active"
    ).order_by(Subscription.created_at.desc()).first()
    
    # 获取用量
    usage = RateLimitService.get_usage_summary(db, current_user.id)
    
    return {
        "plan": current_user.plan,
        "plan_name": plan_config,
        "daily_limit": plan_config["daily_limit"],
        "monthly_limit": plan_config["monthly_limit"],
        "api_access": plan_config["api_access"],
        "team_seats": plan_config["team_seats"],
        "usage": usage,
        "subscription": {
            "id": subscription.id if subscription else None,
            "plan": subscription.plan if subscription else None,
            "status": subscription.payment_status if subscription else None,
            "period_end": subscription.current_period_end.isoformat() if subscription and subscription.current_period_end else None,
        },
    }


@router.post("/billing/checkout")
async def create_checkout(
    request: CreateCheckoutRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """创建Paddle结账会话"""
    # 检查Paddle是否配置
    if not PaddleService.is_configured():
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    # 获取价格ID
    price_id = PaddleService.get_price_id(request.plan, request.interval)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Price ID not found for {request.plan}/{request.interval}")
    
    # 创建结账会话
    session_result = PaddleService.create_transaction_checkout(
        email=current_user.email,
        price_id=price_id,
        success_url=request.success_url,
        cancel_url=request.cancel_url,
        custom_data={"user_id": str(current_user.id), "plan": request.plan},
    )
    
    if not session_result.get("success"):
        raise HTTPException(status_code=500, detail=session_result.get("error"))
    
    return {
        "checkout_url": session_result.get("url") or session_result.get("checkout_url"),
        "checkout_id": session_result.get("transaction_id") or session_result.get("checkout_id"),
    }


@router.get("/billing/portal")
async def create_billing_portal(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """创建Paddle账单管理入口"""
    if not PaddleService.is_configured():
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    # Paddle使用checkout_url作为portal入口
    # 或者重定向到Paddle的客户中心
    return {
        "portal_url": "https://tokesave.com/dashboard",
        "message": "请通过Dashboard管理您的订阅"
    }


@router.post("/billing/webhook")
async def paddle_webhook(
    request: Request,
    paddle_signature: Optional[str] = Header(None, alias="Paddle-Signature")
):
    """Paddle webhook回调"""
    if not PaddleService.is_configured():
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    payload = await request.body()
    
    result = PaddleService.handle_webhook(payload, paddle_signature or "")
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    # 处理事件：更新用户套餐
    event_type = result.get("event_type", "")
    data = result.get("data", {})
    
    # 获取自定义数据中的用户ID
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")
    plan = custom_data.get("plan")
    
    if user_id and plan and event_type in ["subscription.created", "transaction.completed"]:
        # 更新用户套餐
        # 这里需要调用数据库更新逻辑
        pass
    
    return {"received": True, "event": event_type}


@router.post("/billing/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """取消订阅"""
    # 查找活跃订阅
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.payment_status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    if subscription.stripe_subscription_id and PaddleService.is_configured():
        result = PaddleService.cancel_subscription(subscription.stripe_subscription_id)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
    
    # 更新本地状态
    subscription.payment_status = "canceled"
    subscription.canceled_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Subscription will be canceled at the end of the current period"}
