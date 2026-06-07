"""
Stripe支付集成服务
"""

import os
import stripe
from typing import Optional, Dict, Any
from datetime import datetime

from app.models.database import User, Subscription

# Stripe配置
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:3000/dashboard?success=true")
STRIPE_CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "http://localhost:3000/pricing?canceled=true")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


# 价格ID配置（需要先在Stripe Dashboard创建）
STRIPE_PRICE_IDS = {
    "pro_monthly": os.getenv("STRIPE_PRO_MONTHLY_PRICE_ID", ""),
    "pro_yearly": os.getenv("STRIPE_PRO_YEARLY_PRICE_ID", ""),
    "team_monthly": os.getenv("STRIPE_TEAM_MONTHLY_PRICE_ID", ""),
    "team_yearly": os.getenv("STRIPE_TEAM_YEARLY_PRICE_ID", ""),
    "enterprise_monthly": os.getenv("STRIPE_ENTERPRISE_MONTHLY_PRICE_ID", ""),
    "enterprise_yearly": os.getenv("STRIPE_ENTERPRISE_YEARLY_PRICE_ID", ""),
}


class PaymentService:
    """支付服务"""
    
    @staticmethod
    def is_configured() -> bool:
        """检查Stripe是否已配置"""
        return bool(STRIPE_SECRET_KEY)
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> Dict[str, Any]:
        """创建Stripe客户"""
        if not PaymentService.is_configured():
            return {"error": "Stripe not configured"}
        
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name or email,
                metadata={"source": "tokensaver"}
            )
            return {
                "success": True,
                "customer_id": customer.id,
                "customer": customer,
            }
        except stripe.error.StripeError as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def create_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """创建结账会话"""
        if not PaymentService.is_configured():
            return {"error": "Stripe not configured"}
        
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=success_url or STRIPE_SUCCESS_URL,
                cancel_url=cancel_url or STRIPE_CANCEL_URL,
                subscription_data={
                    "trial_period_days": 7,  # 7天免费试用
                },
            )
            return {
                "success": True,
                "session_id": session.id,
                "url": session.url,
            }
        except stripe.error.StripeError as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def create_billing_portal_session(customer_id: str) -> Dict[str, Any]:
        """创建账单管理入口"""
        if not PaymentService.is_configured():
            return {"error": "Stripe not configured"}
        
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=STRIPE_SUCCESS_URL,
            )
            return {
                "success": True,
                "url": session.url,
            }
        except stripe.error.StripeError as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def handle_webhook(payload: bytes, signature: str) -> Dict[str, Any]:
        """处理Stripe webhook"""
        if not PaymentService.is_configured():
            return {"error": "Stripe not configured"}
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return {"error": "Invalid payload"}
        except stripe.error.SignatureVerificationError:
            return {"error": "Invalid signature"}
        
        event_type = event["type"]
        data = event["data"]["object"]
        
        result = {
            "success": True,
            "event_type": event_type,
            "data": data,
        }
        
        if event_type == "checkout.session.completed":
            # 订阅成功
            subscription_id = data.get("subscription")
            customer_id = data.get("customer")
            result["action"] = "subscription_activated"
            result["subscription_id"] = subscription_id
            result["customer_id"] = customer_id
            
        elif event_type == "invoice.payment_succeeded":
            # 续费成功
            subscription_id = data.get("subscription")
            result["action"] = "payment_succeeded"
            result["subscription_id"] = subscription_id
            
        elif event_type == "customer.subscription.deleted":
            # 订阅取消
            subscription_id = data.get("id")
            result["action"] = "subscription_canceled"
            result["subscription_id"] = subscription_id
            
        elif event_type == "invoice.payment_failed":
            # 支付失败
            subscription_id = data.get("subscription")
            result["action"] = "payment_failed"
            result["subscription_id"] = subscription_id
        
        return result
    
    @staticmethod
    def get_subscription(subscription_id: str) -> Dict[str, Any]:
        """获取订阅详情"""
        if not PaymentService.is_configured():
            return {"error": "Stripe not configured"}
        
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                "success": True,
                "subscription": subscription,
            }
        except stripe.error.StripeError as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def cancel_subscription(subscription_id: str) -> Dict[str, Any]:
        """取消订阅（在周期结束时）"""
        if not PaymentService.is_configured():
            return {"error": "Stripe not configured"}
        
        try:
            subscription = stripe.Subscription.delete(subscription_id)
            return {
                "success": True,
                "subscription": subscription,
            }
        except stripe.error.StripeError as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def get_price_id(plan: str, interval: str = "monthly") -> str:
        """获取价格ID"""
        key = f"{plan}_{interval}"
        return STRIPE_PRICE_IDS.get(key, "")
    
    @staticmethod
    def get_plan_from_price_id(price_id: str) -> Optional[str]:
        """从价格ID反推套餐"""
        for key, val in STRIPE_PRICE_IDS.items():
            if val == price_id:
                return key.split("_")[0]
        return None
