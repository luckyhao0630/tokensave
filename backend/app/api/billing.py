from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.models.database import get_db, User, Subscription
from app.api.auth import get_current_user_dependency
from app.services.payment import PaymentService, STRIPE_PRICE_IDS
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
                "monthly": STRIPE_PRICE_IDS.get("pro_monthly", ""),
                "yearly": STRIPE_PRICE_IDS.get("pro_yearly", ""),
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
            "stripe_price_ids": {
                "monthly": STRIPE_PRICE_IDS.get("team_monthly", ""),
                "yearly": STRIPE_PRICE_IDS.get("team_yearly", ""),
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
            "stripe_price_ids": {
                "monthly": STRIPE_PRICE_IDS.get("enterprise_monthly", ""),
                "yearly": STRIPE_PRICE_IDS.get("enterprise_yearly", ""),
            },
        },
    }
    return {"plans": plans, "currency": "USD"}


@router.get("/billing/current")
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
    """创建Stripe结账会话"""
    # 检查Stripe是否配置
    if not PaymentService.is_configured():
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    # 获取价格ID
    price_id = PaymentService.get_price_id(request.plan, request.interval)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Price ID not found for {request.plan}/{request.interval}")
    
    # 创建或获取Stripe客户
    if not current_user.oauth_id:  # 假设oauth_id存储stripe_customer_id
        customer_result = PaymentService.create_customer(
            email=current_user.email,
            name=current_user.name
        )
        if not customer_result.get("success"):
            raise HTTPException(status_code=500, detail=customer_result.get("error"))
        
        customer_id = customer_result["customer_id"]
        # 更新用户记录
        current_user.oauth_id = customer_id
        db.commit()
    else:
        customer_id = current_user.oauth_id
    
    # 创建结账会话
    session_result = PaymentService.create_checkout_session(
        customer_id=customer_id,
        price_id=price_id,
        success_url=request.success_url,
        cancel_url=request.cancel_url,
    )
    
    if not session_result.get("success"):
        raise HTTPException(status_code=500, detail=session_result.get("error"))
    
    return {
        "checkout_url": session_result["url"],
        "session_id": session_result["session_id"],
    }


@router.get("/billing/portal")
async def create_billing_portal(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """创建账单管理入口"""
    if not PaymentService.is_configured():
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    if not current_user.oauth_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found")
    
    result = PaymentService.create_billing_portal_session(current_user.oauth_id)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return {"portal_url": result["url"]}


@router.post("/billing/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")
):
    """Stripe webhook回调"""
    if not PaymentService.is_configured():
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    payload = await request.body()
    
    result = PaymentService.handle_webhook(payload, stripe_signature or "")
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    # 这里可以添加数据库更新逻辑
    # 例如：根据event_type更新用户套餐
    
    return {"received": True, "event": result.get("event_type")}


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
    
    if subscription.stripe_subscription_id and PaymentService.is_configured():
        result = PaymentService.cancel_subscription(subscription.stripe_subscription_id)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
    
    # 更新本地状态
    subscription.payment_status = "canceled"
    subscription.canceled_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Subscription will be canceled at the end of the current period"}
