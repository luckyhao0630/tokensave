from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from app.models.database import get_db, UsageLog, DailyStats, User
from app.api.auth import get_api_key_user, get_current_user_dependency
from app.core.compressor_v2 import TokenCompressor, compress as compress_v2
from app.services.rate_limit import RateLimitService, RateLimitExceeded

# 通用用户依赖（支持API Key或Bearer Token）
async def get_current_user_or_api_key(request: Request):
    """支持API Key或Bearer Token认证"""
    db = next(get_db())
    try:
        # 先尝试 API Key
        x_api_key = request.headers.get("X-API-Key")
        if x_api_key:
            api_key = verify_api_key(db, x_api_key)
            if api_key:
                return api_key.user
        
        # 再尝试 Bearer Token
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            from jose import jwt
            from app.services.auth import SECRET_KEY, ALGORITHM
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                email = payload.get("sub")
                if email:
                    user = db.query(User).filter(User.email == email).first()
                    if user:
                        return user
            except Exception:
                pass
    finally:
        db.close()
    
    raise HTTPException(
        status_code=401,
        detail="认证失败，请提供有效的 API Key 或 Bearer Token"
    )

router = APIRouter(prefix="/api/v1", tags=["compression"])

# 数据模型
class Message(BaseModel):
    role: str
    content: str

class CompressRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "gpt-4o"
    token_budget: Optional[int] = None

class CompressResponse(BaseModel):
    compressed_messages: List[Message]
    tokens_before: int
    tokens_after: int
    savings_percentage: float
    transforms_applied: List[str]
    cost_saved_usd: float

# 压缩核心逻辑 - V2混合引擎
def compress_messages(messages: List[Dict], model: str = "gpt-4o", user_plan: str = "free", enable_llm: bool = False) -> Dict:
    """调用V2混合压缩引擎"""
    compressor = TokenCompressor(enable_llm=enable_llm)
    result = compressor.compress_messages(messages, model, user_plan)
    return {
        "compressed_messages": result.compressed_messages,
        "tokens_before": result.tokens_before,
        "tokens_after": result.tokens_after,
        "savings_percentage": result.compression_ratio * 100,
        "transforms_applied": result.transforms_applied,
        "cost_saved_usd": result.cost_saved_usd,
        "llm_cost_usd": result.llm_cost_usd,
        "cache_hit": result.cache_hit,
        "processing_time_ms": result.processing_time_ms,
        "content_type": result.content_type,
    }

def detect_content_type(messages: List[Dict]) -> str:
    """检测内容类型（兼容性保留）"""
    from app.core.compressor import ContentRouter
    if not messages:
        return "text"
    last_content = messages[-1].get("content", "")
    return ContentRouter.detect(last_content).value

def log_usage(db: Session, user_id: int, api_key_id: Optional[int], 
              request_data: Dict, result_data: Dict):
    """记录用量"""
    usage_log = UsageLog(
        user_id=user_id,
        api_key_id=api_key_id,
        request_type="compress",
        model=request_data.get("model"),
        tokens_before=result_data["tokens_before"],
        tokens_after=result_data["tokens_after"],
        tokens_saved=result_data["tokens_before"] - result_data["tokens_after"],
        compression_ratio=result_data["savings_percentage"] / 100,
        cost_before=result_data.get("cost_before", 0),
        cost_after=result_data.get("cost_after", 0),
        cost_saved=result_data["cost_saved_usd"],
        transforms_applied=json.dumps(result_data["transforms_applied"]),
        status="success",
    )
    db.add(usage_log)
    db.commit()

# API路由
@router.post("/compress", response_model=CompressResponse)
async def compress(
    request: CompressRequest,
    current_user = Depends(get_api_key_user),
    db: Session = Depends(get_db)
):
    """压缩消息接口"""
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        
        # 估算token数用于限流检查
        original_text = json.dumps(messages, ensure_ascii=False)
        estimated_tokens = TokenCompressor.estimate_tokens(original_text)
        
        # 检查配额
        try:
            quota_status = RateLimitService.check_limits(
                db, current_user.id, tokens_count=estimated_tokens
            )
        except RateLimitExceeded as e:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": e.message,
                    "limit_type": e.limit_type,
                    "current": e.current,
                    "limit": e.limit,
                }
            )
        
        # 执行压缩
        result = compress_messages(messages, request.model)
        
        # 记录用量
        api_key_id = None  # 从header中获取
        log_usage(db, current_user.id, api_key_id, {"model": request.model}, result)
        
        return CompressResponse(
            compressed_messages=[Message(role=m["role"], content=m["content"]) for m in result["compressed_messages"]],
            tokens_before=result["tokens_before"],
            tokens_after=result["tokens_after"],
            savings_percentage=result["savings_percentage"],
            transforms_applied=result["transforms_applied"],
            cost_saved_usd=result["cost_saved_usd"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/proxy/{provider}")
async def proxy_compress(
    provider: str,
    request: Dict,
    current_user = Depends(get_api_key_user),
    db: Session = Depends(get_db)
):
    """Proxy模式：接收原始请求，压缩后转发"""
    # 实际实现：解析请求 -> 压缩 -> 转发到provider -> 返回结果
    return {
        "provider": provider,
        "compressed": True,
        "message": "Proxy mode - coming soon",
        "user_id": current_user.id,
    }

@router.get("/usage/stats")
async def get_usage_stats(
    current_user = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """获取用户用量统计"""
    from sqlalchemy import func
    
    stats = db.query(
        func.count(UsageLog.id).label("total_requests"),
        func.sum(UsageLog.tokens_before).label("total_tokens_before"),
        func.sum(UsageLog.tokens_after).label("total_tokens_after"),
        func.sum(UsageLog.tokens_saved).label("total_tokens_saved"),
        func.sum(UsageLog.cost_saved).label("total_cost_saved"),
        func.avg(UsageLog.compression_ratio).label("avg_compression_ratio"),
    ).filter(UsageLog.user_id == current_user.id).first()
    
    # 获取配额信息
    quota = RateLimitService.get_usage_summary(db, current_user.id)
    plan_config = RateLimitService.get_plan_config(quota["plan"])
    
    return {
        "total_requests": stats.total_requests or 0,
        "total_tokens_before": stats.total_tokens_before or 0,
        "total_tokens_after": stats.total_tokens_after or 0,
        "total_tokens_saved": stats.total_tokens_saved or 0,
        "total_cost_saved": round(stats.total_cost_saved or 0, 4),
        "avg_compression_ratio": round((stats.avg_compression_ratio or 0) * 100, 2),
        "quota": {
            "daily": quota["daily"],
            "monthly": quota["monthly"],
            "plan": quota["plan"],
            "plan_config": {
                "daily_limit": plan_config["daily_limit"],
                "monthly_limit": plan_config["monthly_limit"],
                "max_tokens_per_request": plan_config["max_tokens_per_request"],
                "api_access": plan_config["api_access"],
            },
        }
    }

@router.get("/usage/daily")
async def get_daily_usage(
    days: int = 7,
    current_user = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """获取最近N天的每日用量"""
    from sqlalchemy import func, cast, Date
    from datetime import datetime, timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    daily_stats = db.query(
        func.cast(UsageLog.created_at, Date).label("date"),
        func.count(UsageLog.id).label("requests"),
        func.sum(UsageLog.tokens_saved).label("tokens_saved"),
        func.sum(UsageLog.cost_saved).label("cost_saved"),
    ).filter(
        UsageLog.user_id == current_user.id,
        UsageLog.created_at >= start_date
    ).group_by(
        func.cast(UsageLog.created_at, Date)
    ).order_by(
        func.cast(UsageLog.created_at, Date)
    ).all()
    
    return [
        {
            "date": stat.date.strftime("%Y-%m-%d"),
            "requests": stat.requests,
            "tokens_saved": stat.tokens_saved or 0,
            "cost_saved": round(stat.cost_saved or 0, 4),
        }
        for stat in daily_stats
    ]
