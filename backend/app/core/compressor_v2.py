"""
TokenSaver 智能压缩引擎 V2
混合策略：本地规则 + LLM辅助 + 缓存层
"""

import json
import re
import hashlib
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache


class ContentType(Enum):
    JSON = "json"
    LOG = "log"
    CODE = "code"
    HTML = "html"
    TEXT = "text"
    CSV = "csv"
    MARKDOWN = "markdown"
    CONVERSATION = "conversation"  # 多轮对话


@dataclass
class CompressionResult:
    """压缩结果"""
    compressed_messages: List[Dict[str, str]]
    tokens_before: int
    tokens_after: int
    tokens_saved: int
    compression_ratio: float
    transforms_applied: List[str]
    cost_saved_usd: float
    content_type: str
    llm_cost_usd: float = 0.0  # LLM调用成本
    cache_hit: bool = False  # 是否缓存命中
    processing_time_ms: float = 0.0


class ContentRouter:
    """内容类型检测器"""
    
    @staticmethod
    def detect(text: str) -> ContentType:
        text = text.strip()
        if not text:
            return ContentType.TEXT
        
        # 对话检测（多轮对话格式）
        if text.count('"role"') > 1 or (text.count('"user"') > 0 and text.count('"assistant"') > 0):
            return ContentType.CONVERSATION
        
        # JSON 检测
        if text.startswith("{") or text.startswith("["):
            try:
                json.loads(text)
                return ContentType.JSON
            except:
                pass
        
        # 日志检测
        log_markers = ["ERROR", "INFO", "DEBUG", "WARN", "TRACE", 
                       "timestamp", "level", "logger", "exception"]
        if any(m in text[:500] for m in log_markers):
            return ContentType.LOG
        
        # 代码检测
        code_markers = ["def ", "class ", "import ", "function ", 
                        "const ", "var ", "let ", "#include", "package ",
                        "public class", "func ", "async def"]
        if any(m in text[:500] for m in code_markers):
            return ContentType.CODE
        
        # HTML 检测
        html_markers = ["<html", "<div", "<body", "<script", "<style", "<!DOCTYPE"]
        if any(m in text[:500] for m in html_markers):
            return ContentType.HTML
        
        # CSV 检测
        if text.count(",") > 10 and "\n" in text:
            return ContentType.CSV
        
        # Markdown 检测
        md_markers = ["# ", "## ", "```", "| ", "**", "__"]
        if any(m in text[:500] for m in md_markers):
            return ContentType.MARKDOWN
        
        return ContentType.TEXT


class SmartCache:
    """智能缓存层 - 避免重复压缩"""
    
    def __init__(self, max_size: int = 1000, ttl_seconds: int = 3600):
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl_seconds
    
    def _hash(self, messages: List[Dict], model: str) -> str:
        """生成内容指纹"""
        content = json.dumps(messages, sort_keys=True) + model
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, messages: List[Dict], model: str) -> Optional[CompressionResult]:
        key = self._hash(messages, model)
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry["time"] < self.ttl:
                return CompressionResult(
                    compressed_messages=entry["result"]["compressed_messages"],
                    tokens_before=entry["result"]["tokens_before"],
                    tokens_after=entry["result"]["tokens_after"],
                    tokens_saved=entry["result"]["tokens_saved"],
                    compression_ratio=entry["result"]["compression_ratio"],
                    transforms_applied=entry["result"]["transforms_applied"] + ["cache_hit"],
                    cost_saved_usd=entry["result"]["cost_saved_usd"],
                    content_type=entry["result"]["content_type"],
                    cache_hit=True,
                    llm_cost_usd=0.0
                )
            else:
                del self.cache[key]
        return None
    
    def set(self, messages: List[Dict], model: str, result: CompressionResult):
        if len(self.cache) >= self.max_size:
            # LRU淘汰
            oldest = min(self.cache.items(), key=lambda x: x[1]["time"])
            del self.cache[oldest[0]]
        
        key = self._hash(messages, model)
        self.cache[key] = {
            "time": time.time(),
            "result": {
                "compressed_messages": result.compressed_messages,
                "tokens_before": result.tokens_before,
                "tokens_after": result.tokens_after,
                "tokens_saved": result.tokens_saved,
                "compression_ratio": result.compression_ratio,
                "transforms_applied": result.transforms_applied,
                "cost_saved_usd": result.cost_saved_usd,
                "content_type": result.content_type,
            }
        }


class SmartCrusher:
    """JSON/结构化数据压缩器 - V2增强"""
    
    @staticmethod
    def compress(data: Any, max_depth: int = 3, current_depth: int = 0) -> Any:
        """递归压缩JSON数据"""
        if current_depth >= max_depth:
            if isinstance(data, str) and len(data) > 200:
                return data[:100] + "... [truncated]"
            return data
        
        if isinstance(data, dict):
            compressed = {}
            for key, value in data.items():
                # 跳过空值和默认值
                if value is None or value == "" or value == [] or value == {}:
                    continue
                if value is False or value == 0:
                    continue
                compressed[key] = SmartCrusher.compress(value, max_depth, current_depth + 1)
            return compressed
        
        elif isinstance(data, list):
            if len(data) > 20:
                # 保留前5个和后2个，中间用摘要
                kept = data[:5] + data[-2:]
                summary = f"... [{len(data) - 7} items similar]"
                compressed = [SmartCrusher.compress(v, max_depth, current_depth + 1) for v in kept]
                return compressed + [summary]
            return [SmartCrusher.compress(v, max_depth, current_depth + 1) for v in data]
        
        elif isinstance(data, str):
            if len(data) > 1000:
                return data[:200] + f"... [{len(data)} chars total]"
            return data
        
        return data
    
    @classmethod
    def compress_text(cls, text: str) -> str:
        """压缩JSON文本"""
        try:
            data = json.loads(text)
            compressed = cls.compress(data)
            return json.dumps(compressed, separators=(',', ':'), ensure_ascii=False)
        except json.JSONDecodeError:
            return text


class LogCompressor:
    """日志压缩器 - V2增强"""
    
    @staticmethod
    def compress(text: str) -> str:
        lines = text.split('\n')
        if len(lines) <= 10:
            return text
        
        # 提取关键行（错误、警告、开头、结尾）
        key_lines = []
        error_lines = [l for l in lines if any(m in l for m in ["ERROR", "FATAL", "CRITICAL", "Exception"])]
        warn_lines = [l for l in lines if "WARN" in l]
        
        key_lines.extend(lines[:3])  # 开头
        if error_lines:
            key_lines.append(f"... [{len(error_lines)} errors/exceptions] ...")
            key_lines.extend(error_lines[:5])  # 前5条错误
        if warn_lines:
            key_lines.append(f"... [{len(warn_lines)} warnings] ...")
        key_lines.extend(lines[-2:])  # 结尾
        
        return '\n'.join(key_lines)


class CodeCompressor:
    """代码压缩器 - V2增强"""
    
    @staticmethod
    def compress(text: str) -> str:
        lines = text.split('\n')
        if len(lines) <= 30:
            return text
        
        # 保留函数签名和关键逻辑
        result_lines = []
        in_docstring = False
        
        for line in lines:
            stripped = line.strip()
            
            # 跳过空行和注释（保留函数/类定义前的注释）
            if not stripped:
                continue
            if stripped.startswith('#') and not stripped.startswith('# TODO'):
                continue
            
            # 保留关键行
            if any(stripped.startswith(m) for m in ['def ', 'class ', 'import ', 'from ', 'async def', 'if __name__']):
                result_lines.append(line)
            elif 'return ' in stripped or 'yield ' in stripped or 'raise ' in stripped:
                result_lines.append(line)
            elif '=' in stripped and not stripped.startswith('#'):
                result_lines.append(line)
            elif len(result_lines) < len(lines) * 0.3:  # 保留前30%的代码
                result_lines.append(line)
        
        compressed = '\n'.join(result_lines)
        if len(result_lines) < len(lines):
            compressed += f"\n# ... [{len(lines) - len(result_lines)} lines truncated]"
        
        return compressed


class TextCompressor:
    """通用文本压缩器 - V2增强，支持智能摘要"""
    
    @staticmethod
    def compress(text: str, max_chars: int = 2000) -> str:
        if len(text) <= max_chars:
            return text
        
        # 智能截断：保留开头和结尾，中间摘要
        head_len = max_chars // 3
        tail_len = max_chars // 6
        
        head = text[:head_len]
        tail = text[-tail_len:]
        
        # 尝试在句子边界截断
        head = TextCompressor._truncate_at_boundary(head, forward=True)
        tail = TextCompressor._truncate_at_boundary(tail, forward=False)
        
        removed = len(text) - len(head) - len(tail)
        return f"{head}\n\n... [{removed} characters removed] ...\n\n{tail}"
    
    @staticmethod
    def _truncate_at_boundary(text: str, forward: bool = True) -> str:
        boundaries = ['. ', '! ', '? ', '\n\n', '\n']
        if forward:
            # 从末尾找最后一个边界
            for b in boundaries:
                idx = text.rfind(b)
                if idx > len(text) * 0.7:  # 至少保留70%
                    return text[:idx + len(b)]
        else:
            # 从开头找第一个边界
            for b in boundaries:
                idx = text.find(b)
                if idx >= 0 and idx < len(text) * 0.3:  # 跳过前30%
                    return text[idx + len(b):]
        return text
    
    @staticmethod
    def extract_key_points(text: str, max_points: int = 5) -> str:
        """提取关键信息点（用于LLM摘要前的预处理）"""
        # 简单规则：提取列表项、重要句子
        lines = text.split('\n')
        key_points = []
        
        for line in lines:
            stripped = line.strip()
            # 列表项
            if re.match(r'^[\-\*\d]\.', stripped):
                key_points.append(stripped)
            # 重要句子（包含关键词）
            elif any(kw in stripped.lower() for kw in ['important', 'key', 'critical', 'main', '总结', '关键']):
                key_points.append(stripped)
            # 短句（可能是结论）
            elif len(stripped) < 100 and stripped.endswith('.') and len(key_points) < max_points:
                key_points.append(stripped)
        
        if key_points:
            return '\n'.join(key_points[:max_points])
        return text[:500]  # 回退到前500字符


class ConversationCompressor:
    """多轮对话压缩器 - 智能去重和摘要"""
    
    @staticmethod
    def compress(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """压缩多轮对话"""
        if len(messages) <= 3:
            return messages
        
        # 保留系统提示
        system_msgs = [m for m in messages if m.get("role") == "system"]
        
        # 用户和助手消息
        conversation = [m for m in messages if m.get("role") in ["user", "assistant"]]
        
        if len(conversation) <= 4:
            return messages
        
        # 策略：保留最近2轮 + 关键历史摘要
        recent = conversation[-4:]  # 最近2轮
        
        # 提取历史关键信息
        history = conversation[:-4]
        key_points = []
        for msg in history:
            content = msg.get("content", "")
            # 提取关键句子
            sentences = re.split(r'[.!?。！？]', content)
            for s in sentences:
                s = s.strip()
                if len(s) > 10 and len(s) < 200:
                    key_points.append(s)
        
        # 去重
        seen = set()
        unique_points = []
        for p in key_points:
            h = hashlib.md5(p.encode()).hexdigest()[:16]
            if h not in seen and len(unique_points) < 10:
                seen.add(h)
                unique_points.append(p)
        
        # 构建摘要消息
        summary_content = "[Previous conversation summary]\n" + "\n".join(unique_points)
        
        return system_msgs + [{"role": "assistant", "content": summary_content}] + recent


class LLMCompressor:
    """LLM辅助压缩器 - 使用gpt-4o-mini做智能摘要"""
    
    # gpt-4o-mini 定价（$ per 1M tokens）
    PRICING = {
        "input": 0.15,
        "output": 0.60
    }
    
    @staticmethod
    def estimate_cost(input_tokens: int, output_tokens: int) -> float:
        """估算LLM调用成本"""
        input_cost = (input_tokens / 1_000_000) * LLMCompressor.PRICING["input"]
        output_cost = (output_tokens / 1_000_000) * LLMCompressor.PRICING["output"]
        return input_cost + output_cost
    
    @staticmethod
    def should_use_llm(text: str, content_type: ContentType, messages_count: int) -> bool:
        """判断是否应该使用LLM压缩"""
        # 条件：长文本 或 多轮对话 或 复杂Markdown
        if len(text) > 3000:
            return True
        if messages_count > 5:
            return True
        if content_type == ContentType.MARKDOWN and len(text) > 2000:
            return True
        return False
    
    @staticmethod
    def build_summary_prompt(text: str, content_type: str) -> str:
        """构建摘要提示词"""
        prompts = {
            "text": "Summarize the following text concisely, preserving key facts and conclusions:",
            "conversation": "Summarize this conversation history, extracting key decisions, questions, and context:",
            "markdown": "Summarize this document, preserving headings, key points, and conclusions:",
            "code": "Summarize this code, preserving function signatures, key logic, and TODOs:",
            "log": "Summarize these logs, extracting errors, warnings, and key events:",
        }
        
        prompt = prompts.get(content_type, prompts["text"])
        return f"{prompt}\n\n{text[:8000]}\n\nSummary:"
    
    @staticmethod
    def compress_with_llm(text: str, content_type: str, api_key: str = None) -> Tuple[str, float]:
        """
        调用LLM进行智能摘要
        返回: (compressed_text, cost_usd)
        """
        import os
        
        # 如果没有API key，使用环境变量或返回None
        if not api_key:
            api_key = os.environ.get("OPENAI_API_KEY")
        
        if not api_key:
            return None, 0.0
        
        try:
            import requests
            
            prompt = LLMCompressor.build_summary_prompt(text, content_type)
            input_tokens = len(prompt) // 3  # 粗略估算
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are a compression assistant. Summarize content concisely while preserving all key information, facts, and conclusions. Output only the summary, no explanations."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 1500,
                    "temperature": 0.1
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                summary = data["choices"][0]["message"]["content"]
                
                # 计算实际token使用量（从响应中获取）
                usage = data.get("usage", {})
                input_tokens = usage.get("prompt_tokens", input_tokens)
                output_tokens = usage.get("completion_tokens", len(summary) // 3)
                cost = LLMCompressor.estimate_cost(input_tokens, output_tokens)
                
                return summary, cost
            else:
                print(f"LLM compression failed: {response.status_code}")
                return None, 0.0
                
        except Exception as e:
            print(f"LLM compression error: {e}")
            return None, 0.0


class TokenCompressor:
    """主压缩引擎 V2 - 混合策略"""
    
    # 模型定价（每1M tokens，美元）
    MODEL_PRICING = {
        "gpt-4o": {"input": 2.5, "output": 10.0},
        "gpt-4o-mini": {"input": 0.15, "output": 0.6},
        "claude-3-5-sonnet": {"input": 3.0, "output": 15.0},
        "claude-3-haiku": {"input": 0.25, "output": 1.25},
        "deepseek-chat": {"input": 0.14, "output": 0.28},
        "default": {"input": 2.5, "output": 10.0},
    }
    
    # LLM调用配额（每月）
    LLM_QUOTAS = {
        "free": 0,
        "pro": 1000,
        "team": 10000,
        "enterprise": -1,  # 无限
    }
    
    def __init__(self, enable_cache: bool = True, enable_llm: bool = False, llm_api_key: str = None):
        self.cache = SmartCache() if enable_cache else None
        self.enable_llm = enable_llm
        self.llm_api_key = llm_api_key
        self.llm_usage_count = 0  # 本月LLM调用次数
    
    @staticmethod
    def estimate_tokens(text: str) -> int:
        """粗略估算token数（中文约1字1token，英文约4字符1token）"""
        return max(1, len(text) // 3)
    
    def compress_messages(self, messages: List[Dict[str, str]], 
                          model: str = "gpt-4o",
                          user_plan: str = "free",
                          force_llm: bool = False) -> CompressionResult:
        """
        压缩消息列表 - 混合策略
        
        流程:
        1. 检查缓存
        2. 判断内容类型
        3. 如果是多轮对话 → ConversationCompressor
        4. 如果是结构化数据 → 本地规则压缩
        5. 如果文本很长且用户有Pro权限 → LLM辅助压缩
        6. 缓存结果
        """
        start_time = time.time()
        
        # 1. 检查缓存
        if self.cache:
            cached = self.cache.get(messages, model)
            if cached:
                return cached
        
        # 2. 估算原始token数
        original_text = json.dumps(messages, ensure_ascii=False)
        tokens_before = self.estimate_tokens(original_text)
        
        # 3. 判断内容类型和选择压缩策略
        all_content = " ".join([m.get("content", "") for m in messages])
        content_type = ContentRouter.detect(all_content)
        
        # 检查是否是多轮对话
        is_conversation = len(messages) > 3 and any(m.get("role") == "assistant" for m in messages)
        
        compressed_messages = []
        total_transforms = []
        llm_cost = 0.0
        
        # 4. 应用压缩策略
        if is_conversation and len(messages) > 5:
            # 多轮对话压缩
            compressed_messages = ConversationCompressor.compress(messages)
            total_transforms.append("conversation_compressor")
            
        elif content_type in [ContentType.JSON, ContentType.LOG, ContentType.CODE, ContentType.CSV]:
            # 结构化数据 - 本地规则压缩
            for msg in messages:
                content = msg.get("content", "")
                if len(content) < 100:
                    compressed_messages.append(msg)
                    continue
                
                compressed_content = content
                if content_type == ContentType.JSON:
                    compressed_content = SmartCrusher.compress_text(content)
                    total_transforms.append("smart_crusher")
                elif content_type == ContentType.LOG:
                    compressed_content = LogCompressor.compress(content)
                    total_transforms.append("log_compressor")
                elif content_type == ContentType.CODE:
                    compressed_content = CodeCompressor.compress(content)
                    total_transforms.append("code_compressor")
                elif content_type == ContentType.CSV:
                    # CSV压缩逻辑
                    lines = content.split('\n')
                    if len(lines) > 20:
                        header = lines[0]
                        kept = lines[:10] + lines[-2:]
                        compressed_content = header + '\n' + '\n'.join(kept) + f"\n... [{len(lines) - 12} rows] ..."
                        total_transforms.append("csv_compressor")
                
                compressed_messages.append({
                    "role": msg.get("role", "user"),
                    "content": compressed_content
                })
        
        else:
            # 文本/Markdown/HTML - 本地规则 + 可选LLM
            for msg in messages:
                content = msg.get("content", "")
                if len(content) < 500:
                    compressed_messages.append(msg)
                    continue
                
                # 先尝试本地压缩
                compressed_content = TextCompressor.compress(content, max_chars=3000)
                total_transforms.append("text_compressor")
                
                # 判断是否需要LLM辅助
                use_llm = (self.enable_llm or force_llm) and \
                         LLMCompressor.should_use_llm(content, content_type, len(messages))
                
                # 检查配额
                llm_quota = self.LLM_QUOTAS.get(user_plan, 0)
                if use_llm and (llm_quota == -1 or self.llm_usage_count < llm_quota):
                    llm_result, cost = LLMCompressor.compress_with_llm(
                        content, 
                        content_type.value,
                        self.llm_api_key
                    )
                    if llm_result:
                        compressed_content = llm_result
                        llm_cost = cost
                        self.llm_usage_count += 1
                        total_transforms.append("llm_summary")
                        # 移除本地压缩标记，因为LLM替换了它
                        if "text_compressor" in total_transforms:
                            total_transforms.remove("text_compressor")
                
                compressed_messages.append({
                    "role": msg.get("role", "user"),
                    "content": compressed_content
                })
        
        # 5. 计算压缩结果
        compressed_text = json.dumps(compressed_messages, ensure_ascii=False)
        tokens_after = self.estimate_tokens(compressed_text)
        tokens_after = max(1, tokens_after)  # 避免除零
        tokens_saved = max(0, tokens_before - tokens_after)
        compression_ratio = tokens_saved / tokens_before if tokens_before > 0 else 0.0
        
        # 计算费用节省
        pricing = self.MODEL_PRICING.get(model, self.MODEL_PRICING["default"])
        cost_saved = (tokens_saved / 1_000_000) * pricing["input"]
        
        # 去重transforms
        unique_transforms = list(dict.fromkeys(total_transforms))
        
        processing_time = (time.time() - start_time) * 1000
        
        result = CompressionResult(
            compressed_messages=compressed_messages,
            tokens_before=tokens_before,
            tokens_after=tokens_after,
            tokens_saved=tokens_saved,
            compression_ratio=compression_ratio,
            transforms_applied=unique_transforms,
            cost_saved_usd=round(cost_saved, 6),
            content_type=content_type.value,
            llm_cost_usd=round(llm_cost, 6),
            cache_hit=False,
            processing_time_ms=round(processing_time, 2)
        )
        
        # 6. 缓存结果
        if self.cache and not result.cache_hit:
            self.cache.set(messages, model, result)
        
        return result


# 便捷函数
def compress(messages: List[Dict[str, str]], 
              model: str = "gpt-4o",
              user_plan: str = "free",
              enable_llm: bool = False,
              llm_api_key: str = None) -> CompressionResult:
    """便捷压缩函数"""
    compressor = TokenCompressor(enable_llm=enable_llm, llm_api_key=llm_api_key)
    return compressor.compress_messages(messages, model, user_plan)


if __name__ == "__main__":
    # 测试用例
    print("=" * 60)
    print("TokenSaver V2 压缩引擎测试")
    print("=" * 60)
    
    # 测试1: JSON数据
    test_json = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": json.dumps({
            "users": [{"id": i, "name": f"User{i}", "email": f"user{i}@example.com", "status": "active", "created_at": "2024-01-01"} for i in range(100)],
            "metadata": {"total": 100, "page": 1, "per_page": 10}
        })}
    ]
    
    result = compress(test_json, model="gpt-4o", user_plan="free")
    print(f"\n📦 JSON数据压缩:")
    print(f"  Before: {result.tokens_before} tokens")
    print(f"  After:  {result.tokens_after} tokens")
    print(f"  Saved:  {result.tokens_saved} tokens ({result.compression_ratio*100:.1f}%)")
    print(f"  Cost saved: ${result.cost_saved_usd:.6f}")
    print(f"  Transforms: {result.transforms_applied}")
    print(f"  LLM cost: ${result.llm_cost_usd}")
    print(f"  Time: {result.processing_time_ms}ms")
    
    # 测试2: 长文本
    test_text = [
        {"role": "user", "content": "This is a very long text. " * 500 + "\n\nKey conclusion: The compression works well."}
    ]
    
    result = compress(test_text, model="gpt-4o", user_plan="free")
    print(f"\n📝 长文本压缩:")
    print(f"  Before: {result.tokens_before} tokens")
    print(f"  After:  {result.tokens_after} tokens")
    print(f"  Saved:  {result.tokens_saved} tokens ({result.compression_ratio*100:.1f}%)")
    
    # 测试3: 多轮对话
    test_conversation = [
        {"role": "system", "content": "You are an AI assistant."},
        {"role": "user", "content": "Hello, can you help me with Python?"},
        {"role": "assistant", "content": "Sure! What do you need help with?"},
        {"role": "user", "content": "I want to learn about list comprehensions."},
        {"role": "assistant", "content": "List comprehensions are a concise way to create lists..."},
        {"role": "user", "content": "Can you show me an example?"},
        {"role": "assistant", "content": "Sure! Here's an example: [x for x in range(10)]"},
        {"role": "user", "content": "What about nested list comprehensions?"},
        {"role": "assistant", "content": "Nested list comprehensions can be used for..."},
        {"role": "user", "content": "Can you explain dict comprehensions too?"},
        {"role": "assistant", "content": "Dict comprehensions are similar..."},
        {"role": "user", "content": "Now I need help with a specific problem."},
    ]
    
    result = compress(test_conversation, model="gpt-4o", user_plan="free")
    print(f"\n💬 多轮对话压缩:")
    print(f"  Before: {result.tokens_before} tokens ({len(test_conversation)} messages)")
    print(f"  After:  {result.tokens_after} tokens ({len(result.compressed_messages)} messages)")
    print(f"  Saved:  {result.tokens_saved} tokens ({result.compression_ratio*100:.1f}%)")
    print(f"  Transforms: {result.transforms_applied}")
    
    # 测试4: 缓存命中
    result2 = compress(test_json, model="gpt-4o", user_plan="free")
    print(f"\n🔄 缓存测试:")
    print(f"  Cache hit: {result2.cache_hit}")
    print(f"  Time: {result2.processing_time_ms}ms")
    
    print(f"\n{'='*60}")
    print("测试完成!")
    print(f"{'='*60}")
