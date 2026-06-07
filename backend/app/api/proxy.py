"""
Proxy模式 - 拦截OpenAI/Anthropic请求，自动压缩后转发

用法：用户把 base_url 从 https://api.openai.com 改为 https://api.tokesave.com/proxy/openai
所有请求自动压缩后转发到原始provider，返回结果不变。
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse, JSONResponse
import httpx
import json
from typing import Dict, Any, Optional
import os

from app.models.database import get_db, UsageLog
from app.api.auth import get_api_key_user
from app.core.compressor import TokenCompressor, compress as compress_engine
from app.services.rate_limit import RateLimitService, RateLimitExceeded

router = APIRouter(prefix="/proxy", tags=["proxy"])

# 支持的Provider配置
PROVIDERS = {
    "openai": {
        "base_url": "https://api.openai.com",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
    },
    "anthropic": {
        "base_url": "https://api.anthropic.com",
        "auth_header": "x-api-key",
        "auth_prefix": "",
    },
    "deepseek": {
        "base_url": "https://api.deepseek.com",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api",
        "auth_header": "Authorization",
        "auth_prefix": "Bearer ",
    },
}

# HTTP客户端（连接池）
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(30.0, connect=5.0),
    limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
)


class ProxyService:
    """代理服务"""
    
    @staticmethod
    def extract_messages(body: Dict[str, Any]) -> Optional[list]:
        """从请求体中提取messages"""
        # OpenAI格式
        if "messages" in body:
            return body["messages"]
        # Anthropic格式
        if "prompt" in body:
            return [{"role": "user", "content": body["prompt"]}]
        return None
    
    @staticmethod
    def inject_compressed_messages(body: Dict[str, Any], compressed_messages: list) -> Dict[str, Any]:
        """将压缩后的消息注入请求体"""
        new_body = body.copy()
        if "messages" in new_body:
            new_body["messages"] = compressed_messages
        elif "prompt" in new_body:
            # Anthropic格式转换
            if compressed_messages:
                new_body["prompt"] = compressed_messages[0].get("content", "")
        return new_body
    
    @staticmethod
    def get_model_name(body: Dict[str, Any]) -> str:
        """获取模型名称"""
        return body.get("model", "gpt-4o")
    
    @staticmethod
    def estimate_request_tokens(body: Dict[str, Any]) -> int:
        """估算请求token数"""
        messages = ProxyService.extract_messages(body)
        if not messages:
            return 0
        text = json.dumps(messages, ensure_ascii=False)
        return TokenCompressor.estimate_tokens(text)
    
    @staticmethod
    def build_target_url(provider: str, path: str) -> str:
        """构建目标URL"""
        config = PROVIDERS.get(provider)
        if not config:
            raise ValueError(f"Unknown provider: {provider}")
        
        base = config["base_url"].rstrip("/")
        path = path.lstrip("/")
        return f"{base}/{path}"
    
    @staticmethod
    def extract_provider_auth(request: Request, provider: str) -> Optional[str]:
        """提取用户的Provider API Key"""
        config = PROVIDERS.get(provider)
        if not config:
            return None
        
        header_name = config["auth_header"]
        auth_header = request.headers.get(header_name, "")
        
        # 如果auth_header以Bearer开头，提取后面的token
        if auth_header.startswith("Bearer "):
            return auth_header[7:]
        return auth_header


@router.api_route("/{provider}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_request(
    provider: str,
    path: str,
    request: Request,
    current_user = Depends(get_api_key_user),
    db = Depends(get_db)
):
    """
    Proxy模式主入口
    
    路径: /proxy/{provider}/{original_path}
    例如: /proxy/openai/v1/chat/completions
    """
    
    # 检查provider是否支持
    if provider not in PROVIDERS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported provider: {provider}. Supported: {', '.join(PROVIDERS.keys())}"
        )
    
    # 读取请求体
    body = await request.body()
    body_json = None
    if body:
        try:
            body_json = json.loads(body)
        except json.JSONDecodeError:
            pass
    
    # 限流检查
    if body_json:
        estimated_tokens = ProxyService.estimate_request_tokens(body_json)
        try:
            RateLimitService.check_limits(db, current_user.id, tokens_count=estimated_tokens)
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
    
    # 压缩处理
    compressed_body = body
    compression_result = None
    
    if body_json:
        messages = ProxyService.extract_messages(body_json)
        if messages and len(messages) > 0:
            model = ProxyService.get_model_name(body_json)
            compression_result = compress_engine(messages, model)
            
            # 注入压缩后的消息
            new_body = ProxyService.inject_compressed_messages(body_json, compression_result.compressed_messages)
            compressed_body = json.dumps(new_body).encode("utf-8")
    
    # 构建目标请求
    target_url = ProxyService.build_target_url(provider, path)
    
    # 提取用户的Provider API Key
    provider_auth = ProxyService.extract_provider_auth(request, provider)
    if not provider_auth:
        raise HTTPException(
            status_code=401,
            detail=f"Missing {PROVIDERS[provider]['auth_header']} header for {provider}"
        )
    
    # 构建headers
    headers = {}
    config = PROVIDERS[provider]
    
    # 传递原始headers（排除host/content-length）
    for key, value in request.headers.items():
        if key.lower() not in ["host", "content-length", "connection"]:
            headers[key] = value
    
    # 设置Provider认证
    if config["auth_prefix"]:
        headers[config["auth_header"]] = f"{config['auth_prefix']}{provider_auth}"
    else:
        headers[config["auth_header"]] = provider_auth
    
    # 转发请求
    try:
        response = await http_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=compressed_body,
            params=dict(request.query_params),
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Provider error: {str(e)}")
    
    # 记录用量
    if compression_result:
        usage_log = UsageLog(
            user_id=current_user.id,
            request_type="proxy",
            model=ProxyService.get_model_name(body_json) if body_json else None,
            tokens_before=compression_result.tokens_before,
            tokens_after=compression_result.tokens_after,
            tokens_saved=compression_result.tokens_saved,
            compression_ratio=compression_result.compression_ratio,
            cost_saved=compression_result.cost_saved_usd,
            transforms_applied=json.dumps(compression_result.transforms_applied),
            status="success",
        )
        db.add(usage_log)
        db.commit()
    
    # 返回响应
    # 处理流式响应
    content_type = response.headers.get("content-type", "")
    
    if "text/event-stream" in content_type or request.headers.get("accept") == "text/event-stream":
        # SSE流式响应
        async def stream_generator():
            async for chunk in response.aiter_text():
                yield chunk
        
        return StreamingResponse(
            stream_generator(),
            status_code=response.status_code,
            headers={
                "content-type": "text/event-stream",
                "cache-control": "no-cache",
                "connection": "keep-alive",
            },
        )
    
    # 普通响应
    response_headers = {}
    for key, value in response.headers.items():
        if key.lower() not in ["content-encoding", "transfer-encoding", "content-length"]:
            response_headers[key] = value
    
    # 添加压缩信息头
    if compression_result:
        response_headers["X-Tokens-Before"] = str(compression_result.tokens_before)
        response_headers["X-Tokens-After"] = str(compression_result.tokens_after)
        response_headers["X-Tokens-Saved"] = str(compression_result.tokens_saved)
        response_headers["X-Compression-Ratio"] = f"{compression_result.compression_ratio * 100:.1f}%"
        response_headers["X-Cost-Saved-USD"] = str(compression_result.cost_saved_usd)
    
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=response_headers,
    )


@router.get("/providers")
async def list_providers():
    """列出支持的Provider"""
    return {
        "providers": [
            {
                "id": key,
                "name": key.capitalize(),
                "base_url": config["base_url"],
                "auth_header": config["auth_header"],
            }
            for key, config in PROVIDERS.items()
        ]
    }
