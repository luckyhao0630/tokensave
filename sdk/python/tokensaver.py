"""
TokenSaver Python SDK

最简单的使用方式：
    from tokensaver import compress
    
    result = compress(messages, model="gpt-4o")
    print(f"Saved {result.tokens_saved} tokens ({result.compression_ratio*100:.1f}%)")

Proxy模式（零代码改动）：
    import openai
    openai.base_url = "https://api.tokesave.com/proxy/openai/v1/"
    # 其余代码完全不变，所有请求自动压缩
"""

from typing import List, Dict, Optional
import json
import os


class TokenSaverClient:
    """TokenSaver API客户端"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://api.tokesave.com/api/v1"):
        self.api_key = api_key or os.getenv("TOKENSaver_API_KEY")
        self.base_url = base_url.rstrip("/")
        
        if not self.api_key:
            raise ValueError("API key is required. Set TOKENSaver_API_KEY environment variable or pass api_key parameter.")
    
    def compress(self, messages: List[Dict[str, str]], model: str = "gpt-4o") -> Dict:
        """
        压缩消息
        
        Args:
            messages: OpenAI/Anthropic格式的消息列表
            model: 目标模型名称
        
        Returns:
            压缩结果字典
        """
        import urllib.request
        import urllib.error
        
        url = f"{self.base_url}/compress"
        data = json.dumps({
            "messages": messages,
            "model": model
        }).encode("utf-8")
        
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key,
        }
        
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            try:
                error_json = json.loads(error_body)
                raise Exception(f"API Error: {error_json.get('detail', error_body)}")
            except json.JSONDecodeError:
                raise Exception(f"API Error: {error_body}")
    
    def get_usage_stats(self) -> Dict:
        """获取用量统计"""
        import urllib.request
        
        url = f"{self.base_url}/usage/stats"
        headers = {"X-API-Key": self.api_key}
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    
    def get_daily_usage(self, days: int = 7) -> List[Dict]:
        """获取最近N天的每日用量"""
        import urllib.request
        
        url = f"{self.base_url}/usage/daily?days={days}"
        headers = {"X-API-Key": self.api_key}
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))


def compress(messages: List[Dict[str, str]], model: str = "gpt-4o", api_key: Optional[str] = None) -> Dict:
    """
    便捷压缩函数
    
    用法:
        from tokensaver import compress
        
        messages = [
            {"role": "user", "content": "分析这段JSON数据..."},
            {"role": "tool", "content": json.dumps(large_json_data)}
        ]
        
        result = compress(messages, model="gpt-4o")
        
        # result 包含:
        # - compressed_messages: 压缩后的消息
        # - tokens_before: 压缩前token数
        # - tokens_after: 压缩后token数
        # - savings_percentage: 压缩率百分比
        # - transforms_applied: 应用的压缩算法
        # - cost_saved_usd: 节省的费用(USD)
    """
    client = TokenSaverClient(api_key=api_key)
    return client.compress(messages, model)


def get_usage(api_key: Optional[str] = None) -> Dict:
    """获取用量统计"""
    client = TokenSaverClient(api_key=api_key)
    return client.get_usage_stats()


def proxy_openai():
    """
    返回Proxy模式的base_url配置
    
    用法:
        import openai
        from tokensaver import proxy_openai
        
        # 设置Proxy URL
        openai.base_url = proxy_openai()
        openai.api_key = "your-openai-api-key"
        
        # 所有请求自动压缩
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[...]
        )
    """
    base_url = os.getenv("TOKENSaver_BASE_URL", "https://api.tokesave.com")
    return f"{base_url}/proxy/openai/v1/"


def proxy_anthropic():
    """返回Anthropic Proxy URL"""
    base_url = os.getenv("TOKENSaver_BASE_URL", "https://api.tokesave.com")
    return f"{base_url}/proxy/anthropic/"


def proxy_deepseek():
    """返回DeepSeek Proxy URL"""
    base_url = os.getenv("TOKENSaver_BASE_URL", "https://api.tokesave.com")
    return f"{base_url}/proxy/deepseek/v1/"


# 导出
__all__ = [
    "TokenSaverClient",
    "compress",
    "get_usage",
    "proxy_openai",
    "proxy_anthropic",
    "proxy_deepseek",
]