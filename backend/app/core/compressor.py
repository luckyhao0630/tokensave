"""
TokenSaver 核心压缩引擎
兼容 Python 3.9+，不依赖外部包

实现 Headroom 的简化版核心算法：
1. SmartCrusher - JSON/结构化数据压缩
2. TextCompressor - 文本摘要压缩
3. ContentRouter - 内容类型检测+路由
"""

import json
import re
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class ContentType(Enum):
    JSON = "json"
    LOG = "log"
    CODE = "code"
    HTML = "html"
    TEXT = "text"
    CSV = "csv"
    MARKDOWN = "markdown"


@dataclass
class CompressionResult:
    """压缩结果"""
    compressed_messages: List[Dict[str, str]]
    tokens_before: int
    tokens_after: int
    tokens_saved: int
    compression_ratio: float  # 0.0-1.0, 越大压缩率越高
    transforms_applied: List[str]
    cost_saved_usd: float
    content_type: str


class ContentRouter:
    """内容类型检测器"""
    
    @staticmethod
    def detect(text: str) -> ContentType:
        text = text.strip()
        if not text:
            return ContentType.TEXT
        
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


class SmartCrusher:
    """JSON/结构化数据压缩器"""
    
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
    """日志压缩器"""
    
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
    """代码压缩器"""
    
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
    """通用文本压缩器"""
    
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


class HTMLCompressor:
    """HTML压缩器"""
    
    @staticmethod
    def compress(text: str) -> str:
        # 移除注释
        text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
        # 移除多余空白
        text = re.sub(r'>\s+<', '><', text)
        text = re.sub(r'\s+', ' ', text)
        # 如果太长，只保留结构
        if len(text) > 3000:
            # 提取标签结构
            tags = re.findall(r'<[^>]+>', text)
            return f"HTML structure ({len(tags)} tags): {' '.join(tags[:50])}..."
        return text


class CSVCompressor:
    """CSV压缩器"""
    
    @staticmethod
    def compress(text: str) -> str:
        lines = text.split('\n')
        if len(lines) <= 20:
            return text
        
        header = lines[0]
        # 保留前10行和后2行
        kept = lines[:10] + lines[-2:]
        return f"{header}\n" + '\n'.join(kept) + f"\n... [{len(lines) - 12} rows] ..."


class MarkdownCompressor:
    """Markdown压缩器"""
    
    @staticmethod
    def compress(text: str) -> str:
        lines = text.split('\n')
        if len(lines) <= 50:
            return text
        
        # 保留标题、列表、代码块开头
        result = []
        in_code = False
        for line in lines:
            if line.strip().startswith('```'):
                in_code = not in_code
                result.append(line)
            elif line.startswith('#'):
                result.append(line)
            elif line.startswith('- ') or line.startswith('* ') or re.match(r'^\d+\. ', line):
                result.append(line)
            elif in_code:
                result.append(line)
            elif len(result) < len(lines) * 0.4:
                result.append(line)
        
        if len(result) < len(lines):
            result.append(f"\n... [{len(lines) - len(result)} lines truncated] ...")
        
        return '\n'.join(result)


class TokenCompressor:
    """主压缩引擎"""
    
    # 模型定价（每1M tokens，美元）
    MODEL_PRICING = {
        "gpt-4o": {"input": 2.5, "output": 10.0},
        "gpt-4o-mini": {"input": 0.15, "output": 0.6},
        "claude-3-5-sonnet": {"input": 3.0, "output": 15.0},
        "claude-3-haiku": {"input": 0.25, "output": 1.25},
        "deepseek-chat": {"input": 0.14, "output": 0.28},
        "default": {"input": 2.5, "output": 10.0},
    }
    
    @staticmethod
    def estimate_tokens(text: str) -> int:
        """粗略估算token数（中文约1字1token，英文约4字符1token）"""
        # 简单估算：混合文本平均约3字符/1token
        return max(1, len(text) // 3)
    
    @classmethod
    def compress_messages(cls, messages: List[Dict[str, str]], model: str = "gpt-4o") -> CompressionResult:
        """
        压缩消息列表
        
        Args:
            messages: OpenAI/Anthropic格式的消息列表
            model: 目标模型名称
        
        Returns:
            CompressionResult: 压缩结果
        """
        original_text = json.dumps(messages, ensure_ascii=False)
        tokens_before = cls.estimate_tokens(original_text)
        
        compressed_messages = []
        total_transforms = []
        content_types = []
        
        for msg in messages:
            content = msg.get("content", "")
            if not content or len(content) < 100:
                # 短内容不压缩
                compressed_messages.append(msg)
                continue
            
            # 检测内容类型
            content_type = ContentRouter.detect(content)
            content_types.append(content_type.value)
            
            # 根据类型选择压缩器
            compressed_content = content
            transforms = []
            
            if content_type == ContentType.JSON:
                compressed_content = SmartCrusher.compress_text(content)
                transforms.append("smart_crusher")
            elif content_type == ContentType.LOG:
                compressed_content = LogCompressor.compress(content)
                transforms.append("log_compressor")
            elif content_type == ContentType.CODE:
                compressed_content = CodeCompressor.compress(content)
                transforms.append("code_compressor")
            elif content_type == ContentType.HTML:
                compressed_content = HTMLCompressor.compress(content)
                transforms.append("html_compressor")
            elif content_type == ContentType.CSV:
                compressed_content = CSVCompressor.compress(content)
                transforms.append("csv_compressor")
            elif content_type == ContentType.MARKDOWN:
                compressed_content = MarkdownCompressor.compress(content)
                transforms.append("markdown_compressor")
            else:
                compressed_content = TextCompressor.compress(content)
                transforms.append("text_compressor")
            
            # 总是应用cache_aligner（内容去重）
            # 简化版：检查是否有明显重复
            if len(compressed_content) > 500:
                lines = compressed_content.split('\n')
                seen = set()
                unique_lines = []
                dup_count = 0
                for line in lines:
                    h = hashlib.md5(line.strip().encode()).hexdigest()[:8]
                    if h in seen and len(line.strip()) > 20:
                        dup_count += 1
                        continue
                    seen.add(h)
                    unique_lines.append(line)
                if dup_count > 0:
                    compressed_content = '\n'.join(unique_lines)
                    transforms.append("cache_aligner")
            
            compressed_messages.append({
                "role": msg.get("role", "user"),
                "content": compressed_content
            })
            total_transforms.extend(transforms)
        
        # 计算压缩后token数
        compressed_text = json.dumps(compressed_messages, ensure_ascii=False)
        tokens_after = cls.estimate_tokens(compressed_text)
        tokens_saved = max(0, tokens_before - tokens_after)
        compression_ratio = tokens_saved / tokens_before if tokens_before > 0 else 0.0
        
        # 计算费用节省
        pricing = cls.MODEL_PRICING.get(model, cls.MODEL_PRICING["default"])
        cost_saved = (tokens_saved / 1_000_000) * pricing["input"]
        
        # 去重transforms
        unique_transforms = list(dict.fromkeys(total_transforms))
        
        return CompressionResult(
            compressed_messages=compressed_messages,
            tokens_before=tokens_before,
            tokens_after=tokens_after,
            tokens_saved=tokens_saved,
            compression_ratio=compression_ratio,
            transforms_applied=unique_transforms,
            cost_saved_usd=round(cost_saved, 6),
            content_type=content_types[0] if content_types else "text"
        )


# 便捷函数
def compress(messages: List[Dict[str, str]], model: str = "gpt-4o") -> CompressionResult:
    """便捷压缩函数"""
    return TokenCompressor.compress_messages(messages, model)


if __name__ == "__main__":
    # 测试
    test_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": json.dumps({
            "users": [{"id": i, "name": f"User{i}", "email": f"user{i}@example.com"} for i in range(100)],
            "metadata": {"total": 100, "page": 1}
        })},
    ]
    
    result = compress(test_messages, model="gpt-4o")
    print(f"Before: {result.tokens_before} tokens")
    print(f"After: {result.tokens_after} tokens")
    print(f"Saved: {result.tokens_saved} tokens ({result.compression_ratio*100:.1f}%)")
    print(f"Transforms: {result.transforms_applied}")
    print(f"Cost saved: ${result.cost_saved_usd:.6f}")
