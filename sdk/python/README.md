# TokenSaver Python SDK

## 安装

```bash
pip install tokensaver
```

## 快速开始

### 1. 压缩API（显式调用）

```python
from tokensaver import compress
import json

# 你的消息（包含大量JSON数据）
messages = [
    {"role": "user", "content": "分析这些用户数据"},
    {"role": "tool", "content": json.dumps([{"id": i, "data": "..."} for i in range(1000)])}
]

# 压缩
result = compress(messages, model="gpt-4o")

print(f"压缩前: {result['tokens_before']} tokens")
print(f"压缩后: {result['tokens_after']} tokens")
print(f"节省: {result['savings_percentage']:.1f}%")
print(f"节省费用: ${result['cost_saved_usd']:.6f}")

# 使用压缩后的消息发送给LLM
import openai
client = openai.OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=result["compressed_messages"]
)
```

### 2. Proxy模式（零代码改动）

```python
import openai
from tokensaver import proxy_openai

# 只需改base_url，其余代码完全不变
client = openai.OpenAI(
    base_url=proxy_openai(),
    api_key="your-openai-api-key"
)

# 所有请求自动压缩，返回值不变
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[...]
)
```

### 3. 用量查询

```python
from tokensaver import get_usage

stats = get_usage()
print(f"总请求: {stats['total_requests']}")
print(f"总节省: {stats['total_tokens_saved']} tokens")
print(f"总节省费用: ${stats['total_cost_saved']}")
```

## 环境变量

```bash
export TOKENSaver_API_KEY="your-api-key"
export TOKENSaver_BASE_URL="https://api.tokesave.com"  # 可选，默认
```

## 高级用法

### 客户端模式

```python
from tokensaver import TokenSaverClient

client = TokenSaverClient(api_key="your-key")

# 压缩
result = client.compress(messages, model="claude-3-5-sonnet")

# 用量
stats = client.get_usage_stats()
daily = client.get_daily_usage(days=30)
```

### 支持的模型

- `gpt-4o` / `gpt-4o-mini`
- `claude-3-5-sonnet` / `claude-3-haiku`
- `deepseek-chat`
- 其他模型自动使用默认定价

### 支持的Provider Proxy

- OpenAI (`proxy_openai()`)
- Anthropic (`proxy_anthropic()`)
- DeepSeek (`proxy_deepseek()`)

## 压缩效果

| 内容类型 | 压缩率 | 示例 |
|---------|--------|------|
| JSON数据 | 60-95% | 1000条用户记录 → 80%压缩 |
| 日志 | 70-90% | 1000行日志 → 保留关键行 |
| 代码 | 40-70% | 保留函数签名和关键逻辑 |
| 文本 | 30-50% | 智能截断保留关键信息 |

## 许可证

Apache-2.0
