# 🚀 TokenSaver - 让 LLM 费用降低 60-95%

**TokenSaver** 是一个智能 LLM Token 压缩服务，通过 AI 驱动的压缩算法，帮助开发者和企业大幅降低 AI 使用成本。

## ✨ 核心功能

- **🎯 智能压缩** - 自动识别冗余内容，保留关键信息
- **📊 多种格式** - 支持 JSON、日志、代码、文本、Markdown 等
- **🔌 零改造** - 一行代码接入，替换 API 地址即可
- **📈 实时监控** - 统计节省的 Token 数和费用
- **🎉 限时免费** - 所有功能免费体验至 2026-07-08

## 🚀 快速接入（3步）

### 1. 注册账号
访问 https://www.tokesave.com/register

### 2. 创建 API Key
登录 Dashboard → 点击「创建 API Key」→ 复制 Key

### 3. 替换 API 地址

```python
# 原来的代码
import requests

response = requests.post(
    "https://api.openai.com/v1/chat/completions",  # ← 替换这行
    headers={"Authorization": "Bearer sk-xxx"},
    json={"model": "gpt-4o", "messages": messages}
)

# 修改后（只需改 URL + 添加 X-API-Key）
import requests

response = requests.post(
    "https://api.tokesave.com/proxy/openai/v1/chat/completions",  # ← 新地址
    headers={
        "Authorization": "Bearer sk-xxx",
        "X-API-Key": "ts_xxxxxxxx_xxxxxxxxxxxxx",  # ← 添加这行
    },
    json={"model": "gpt-4o", "messages": messages}
)
```

## 💰 节省效果

| 场景 | 压缩前 | 压缩后 | 节省比例 |
|------|--------|--------|----------|
| JSON 数据 | 4000 tokens | 800 tokens | **80%** |
| 日志文件 | 3000 tokens | 600 tokens | **80%** |
| 多轮对话 | 1500 tokens | 900 tokens | **40%** |
| 长文本 | 5000 tokens | 1500 tokens | **70%** |

## 🔧 支持的 AI 服务商

| 服务商 | 代理地址 |
|--------|----------|
| OpenAI | `https://api.tokesave.com/proxy/openai/v1/chat/completions` |
| Anthropic | `https://api.tokesave.com/proxy/anthropic/v1/messages` |
| DeepSeek | `https://api.tokesave.com/proxy/deepseek/v1/chat/completions` |
| OpenRouter | `https://api.tokesave.com/proxy/openrouter/v1/chat/completions` |

## 📝 完整示例

```python
import requests
import os

API_KEY = os.getenv("TOKESAVER_API_KEY", "ts_xxxxxxxx_xxxxxxxxxxxxx")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "sk-xxxxxxxx")

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "帮我总结这份报告..."}
]

response = requests.post(
    "https://api.tokesave.com/proxy/openai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {OPENAI_KEY}",
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-4o",
        "messages": messages,
    },
    timeout=60
)

result = response.json()

# 查看节省了多少
print("压缩前:", response.headers.get("X-Tokens-Before"))
print("压缩后:", response.headers.get("X-Tokens-After"))
print("节省:", response.headers.get("X-Tokens-Saved"))
print("压缩率:", response.headers.get("X-Compression-Ratio"))
print("节省费用:", response.headers.get("X-Cost-Saved-USD"))
```

## 🎁 限时免费活动

🎉 **所有功能免费体验**（2026-07-08 结束）

- ✅ 无限次请求
- ✅ 所有压缩算法
- ✅ API Key 访问
- ✅ 高级分析

[立即注册](https://www.tokesave.com/register)

## 📊 定价

| 套餐 | 价格 | 请求次数 | 功能 |
|------|------|----------|------|
| 免费版 | $0 | 100次/天 | 基础压缩 |
| 专业版 | $19/月 | 无限 | 高级压缩 + API |
| 团队版 | $99/月 | 无限 | 团队管理 + 5人 |
| 企业版 | 定制 | 无限 | 私有部署 + SLA |

## 📚 文档

- [完整教程](https://www.tokesave.com/guide)
- [API 文档](https://www.tokesave.com/docs)
- [联系我们](https://www.tokesave.com/contact)

## 🛠️ 技术栈

- **前端**: Next.js 16 + React + Tailwind CSS
- **后端**: FastAPI + Python
- **数据库**: PostgreSQL (Neon)
- **部署**: Vercel + Railway
- **支付**: Paddle (全球，支持中国身份)

## 🌟 为什么使用 TokenSaver？

1. **💰 省钱** - 平均节省 60-95% Token 费用
2. **⚡ 快速** - 1ms 压缩延迟，不影响响应速度
3. **🔒 安全** - 数据压缩，不修改语义
4. **🌐 全球** - 支持所有主流 AI 服务商
5. **🎯 智能** - 自动识别内容类型，选择最优压缩策略

## 📞 联系我们

- 邮箱: support@tokensave.com
- 网站: https://www.tokesave.com
- 教程: https://www.tokesave.com/guide

---

⭐ **Star 我们，支持开源！**

[GitHub](https://github.com/luckyhao0630/tokensave) | [Twitter](https://twitter.com/tokensave) | [Discord](https://discord.gg/tokensave)
