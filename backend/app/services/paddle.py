"""
Paddle 支付集成服务
支持中国身份，无需公司，自动处理全球税务

文档: https://developer.paddle.com/
"""

import os
import requests
from typing import Optional, Dict, Any
from datetime import datetime

# Paddle配置
PADDLE_API_KEY = os.getenv("PADDLE_API_KEY", "")
PADDLE_WEBHOOK_SECRET = os.getenv("PADDLE_WEBHOOK_SECRET", "")
PADDLE_ENVIRONMENT = os.getenv("PADDLE_ENVIRONMENT", "sandbox")  # sandbox or live
PADDLE_VENDOR_ID = os.getenv("PADDLE_VENDOR_ID", "")

# API基础URL
PADDLE_BASE_URL = "https://sandbox-api.paddle.com" if PADDLE_ENVIRONMENT == "sandbox" else "https://api.paddle.com"

# 产品/价格ID配置（需要在Paddle Dashboard创建）
PADDLE_PRICE_IDS = {
    "pro_monthly": os.getenv("PADDLE_PRO_MONTHLY_PRICE_ID", ""),
    "pro_yearly": os.getenv("PADDLE_PRO_YEARLY_PRICE_ID", ""),
    "team_monthly": os.getenv("PADDLE_TEAM_MONTHLY_PRICE_ID", ""),
    "team_yearly": os.getenv("PADDLE_TEAM_YEARLY_PRICE_ID", ""),
    "enterprise_monthly": os.getenv("PADDLE_ENTERPRISE_MONTHLY_PRICE_ID", ""),
    "enterprise_yearly": os.getenv("PADDLE_ENTERPRISE_YEARLY_PRICE_ID", ""),
}


class PaddleService:
    """Paddle支付服务"""
    
    @staticmethod
    def is_configured() -> bool:
        """检查Paddle是否已配置"""
        return bool(PADDLE_API_KEY)
    
    @staticmethod
    def _headers() -> Dict[str, str]:
        """API请求头"""
        return {
            "Authorization": f"Bearer {PADDLE_API_KEY}",
            "Content-Type": "application/json",
        }
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> Dict[str, Any]:
        """创建Paddle客户"""
        if not PaddleService.is_configured():
            return {"error": "Paddle not configured", "success": False}
        
        try:
            response = requests.post(
                f"{PADDLE_BASE_URL}/customers",
                headers=PaddleService._headers(),
                json={
                    "email": email,
                    "name": name or email.split("@")[0],
                },
                timeout=30
            )
            data = response.json()
            
            if response.status_code in [200, 201]:
                return {
                    "success": True,
                    "customer_id": data.get("data", {}).get("id"),
                    "customer": data.get("data"),
                }
            else:
                return {
                    "success": False,
                    "error": data.get("error", {}).get("detail", "Unknown error"),
                }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def create_checkout(
        customer_id: Optional[str] = None,
        price_id: str = "",
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
        custom_data: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """创建结账链接"""
        if not PaddleService.is_configured():
            return {"error": "Paddle not configured", "success": False}
        
        try:
            payload = {
                "items": [
                    {
                        "price_id": price_id,
                        "quantity": 1,
                    }
                ],
                "settings": {
                    "success_url": success_url or "https://tokesave.com/dashboard?success=true",
                    "cancel_url": cancel_url or "https://tokesave.com/pricing?canceled=true",
                },
            }
            
            if customer_id:
                payload["customer_id"] = customer_id
            
            if custom_data:
                payload["custom_data"] = custom_data
            
            response = requests.post(
                f"{PADDLE_BASE_URL}/checkouts",
                headers=PaddleService._headers(),
                json=payload,
                timeout=30
            )
            data = response.json()
            
            if response.status_code in [200, 201]:
                checkout_data = data.get("data", {})
                return {
                    "success": True,
                    "checkout_id": checkout_data.get("id"),
                    "url": checkout_data.get("url"),
                }
            else:
                return {
                    "success": False,
                    "error": data.get("error", {}).get("detail", "Unknown error"),
                }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def create_transaction_checkout(
        email: str,
        price_id: str = "",
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
        custom_data: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """创建一次性交易结账（不需要预创建客户）"""
        if not PaddleService.is_configured():
            return {"error": "Paddle not configured", "success": False}
        
        try:
            payload = {
                "items": [
                    {
                        "price_id": price_id,
                        "quantity": 1,
                    }
                ],
                "customer": {
                    "email": email,
                },
                "settings": {
                    "success_url": success_url or "https://tokesave.com/dashboard?success=true",
                    "cancel_url": cancel_url or "https://tokesave.com/pricing?canceled=true",
                },
            }
            
            if custom_data:
                payload["custom_data"] = custom_data
            
            response = requests.post(
                f"{PADDLE_BASE_URL}/transactions",
                headers=PaddleService._headers(),
                json=payload,
                timeout=30
            )
            data = response.json()
            
            if response.status_code in [200, 201]:
                transaction_data = data.get("data", {})
                return {
                    "success": True,
                    "transaction_id": transaction_data.get("id"),
                    "checkout_url": transaction_data.get("checkout", {}).get("url"),
                    "url": transaction_data.get("checkout", {}).get("url"),
                }
            else:
                return {
                    "success": False,
                    "error": data.get("error", {}).get("detail", "Unknown error"),
                }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def get_subscription(subscription_id: str) -> Dict[str, Any]:
        """获取订阅详情"""
        if not PaddleService.is_configured():
            return {"error": "Paddle not configured", "success": False}
        
        try:
            response = requests.get(
                f"{PADDLE_BASE_URL}/subscriptions/{subscription_id}",
                headers=PaddleService._headers(),
                timeout=30
            )
            data = response.json()
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "subscription": data.get("data"),
                }
            else:
                return {
                    "success": False,
                    "error": data.get("error", {}).get("detail", "Unknown error"),
                }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def cancel_subscription(subscription_id: str) -> Dict[str, Any]:
        """取消订阅（在周期结束时）"""
        if not PaddleService.is_configured():
            return {"error": "Paddle not configured", "success": False}
        
        try:
            response = requests.patch(
                f"{PADDLE_BASE_URL}/subscriptions/{subscription_id}",
                headers=PaddleService._headers(),
                json={
                    "status": "canceled",
                },
                timeout=30
            )
            data = response.json()
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "subscription": data.get("data"),
                }
            else:
                return {
                    "success": False,
                    "error": data.get("error", {}).get("detail", "Unknown error"),
                }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def handle_webhook(payload: bytes, signature: str) -> Dict[str, Any]:
        """处理Paddle webhook"""
        # Paddle webhook验证使用签名
        # 简化版：建议在生产环境中实现完整的签名验证
        # 参考: https://developer.paddle.com/webhooks/signature-verification
        
        try:
            import json
            event_data = json.loads(payload)
            event_type = event_data.get("event_type", "")
            
            result = {
                "success": True,
                "event_type": event_type,
                "data": event_data.get("data", {}),
            }
            
            if event_type == "subscription.created":
                result["action"] = "subscription_created"
            elif event_type == "subscription.updated":
                result["action"] = "subscription_updated"
            elif event_type == "subscription.canceled":
                result["action"] = "subscription_canceled"
            elif event_type == "transaction.completed":
                result["action"] = "payment_completed"
            elif event_type == "transaction.payment_failed":
                result["action"] = "payment_failed"
            
            return result
        except Exception as e:
            return {"error": str(e), "success": False}
    
    @staticmethod
    def get_price_id(plan: str, interval: str = "monthly") -> str:
        """获取价格ID"""
        key = f"{plan}_{interval}"
        return PADDLE_PRICE_IDS.get(key, "")
    
    @staticmethod
    def get_plan_from_price_id(price_id: str) -> Optional[str]:
        """从价格ID反推套餐"""
        for key, val in PADDLE_PRICE_IDS.items():
            if val == price_id:
                return key.split("_")[0]
        return None
