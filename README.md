# TokenSaver - LLM Token压缩SaaS

**项目代号**: TokenSaver  
**基于**: headroom (chopratejas/headroom)  
**目标**: 为国内+海外AI开发者提供Token压缩API服务，节省60-95% LLM费用  
**设计风格**: 苹果简约风，大厂质感  

---

## 产品架构

### 技术栈
```
后端:
  - API服务: Python FastAPI
  - 压缩核心: 复用headroom (Rust/Python混合)
  - 数据库: PostgreSQL (用户/用量) + Redis (缓存/限流)
  - 任务队列: Celery + Redis
  - 监控: Prometheus + Grafana

前端:
  - 框架: Next.js 14 + React 18
  - 样式: Tailwind CSS + shadcn/ui
  - 状态: Zustand
  - 图表: Recharts
  - 动画: Framer Motion

基础设施:
  - 国内: 阿里云ECS + CDN
  - 海外: Vercel + Railway
  - 数据库: Supabase/Neon
  - 支付: Stripe(海外) + 微信支付(国内)
```

### 核心功能模块

#### 1. 压缩API服务
```python
POST /api/v1/compress
Headers: X-API-Key: xxx
Body: {
  "messages": [...],  # OpenAI/Anthropic格式
  "model": "gpt-4o",   # 目标模型
  "token_budget": 50000  # 可选，最大保留token数
}
Response: {
  "compressed_messages": [...],
  "tokens_before": 10000,
  "tokens_after": 2000,
  "savings_percentage": 80,
  "transforms_applied": ["smart_crusher", "cache_aligner"],
  "cost_saved_usd": 0.24
}
```

#### 2. Proxy模式
```
用户改base_url: https://api.openai.com → https://api.tokesave.com/proxy
所有请求自动压缩后转发到原始provider
返回结果不变
```

#### 3. SDK支持
```python
# Python
from tokensaver import TokenSaverClient
client = TokenSaverClient(api_key="xxx")
compressed = client.compress(messages)

// TypeScript
import { compress } from "tokensaver";
const result = await compress(messages, { model: "gpt-4o" });
```

#### 4. Dashboard功能
- 实时用量统计（token节省/费用节省）
- API Key管理（创建/删除/限额）
- 团队管理（成员/权限/用量分配）
- 压缩效果可视化（前后对比）
- 计费中心（套餐/账单/升级）

---

## 收费模式

### 国内版
| 套餐 | 价格 | 包含 | 目标用户 |
|------|------|------|---------|
| 免费版 | ¥0 | 100次/天，基础压缩 | 个人开发者试用 |
| 专业版 | ¥49/月 | 无限次，高级压缩，API支持 | 个人开发者 |
| 团队版 | ¥199/月 | 5成员，团队管理，高级统计 | 小团队 |
| 企业版 | ¥999/月 | 无限成员，私有部署，SLA | 企业 |

### 海外版
| 套餐 | 价格 | 包含 |
|------|------|------|
| Free | $0 | 100/day |
| Pro | $19/mo | Unlimited, API access |
| Team | $99/mo | 5 seats, team analytics |
| Enterprise | $499/mo | Unlimited, dedicated support |

---

## 开发里程碑

### Week 1: 核心引擎
- [ ] clone headroom，研究核心压缩API
- [ ] 封装Python SDK，提供compress()接口
- [ ] 搭建FastAPI服务框架
- [ ] 实现基础压缩API端点

### Week 2: 用户系统+Dashboard
- [ ] 用户注册/登录（邮箱+OAuth）
- [ ] API Key生成/管理
- [ ] Dashboard前端（用量统计/图表）
- [ ] 数据库模型设计

### Week 3: 支付+计费
- [ ] Stripe集成（海外）
- [ ] 用量限流/配额系统
- [ ] 计费逻辑（按次/按月）
- [ ] 升级/降级流程

### Week 4: 上线准备
- [ ] Proxy模式实现
- [ ] 多语言SDK发布（JS/Go）
- [ ] 文档网站
- [ ] Product Hunt上线准备

---

## 设计风格指南

### 苹果简约风设计原则
```
色彩:
  - 主色: #000000 (黑), #FFFFFF (白)
  - 强调色: #0071E3 (苹果蓝)
  - 辅助色: #F5F5F7 (浅灰背景), #1D1D1F (深灰文字)
  - 成功: #34C759 (绿)
  - 警告: #FF9500 (橙)

字体:
  - 中文: -apple-system, "PingFang SC", "Hiragino Sans GB"
  - 英文: -apple-system, "SF Pro Display", "SF Pro Text"
  - 标题: 600 weight, 大字号，紧凑行高
  - 正文: 400 weight, 16px, 1.5行高

布局:
  - 大量留白
  - 内容居中，max-width 1200px
  - 圆角: 12px (卡片), 24px (按钮), 999px (pill)
  - 阴影: 极简，0 4px 24px rgba(0,0,0,0.08)

动效:
  - 页面切换: 0.3s ease-out
  - 按钮hover: 0.2s ease
  - 数字变化: 1s ease-out
  - 滚动触发: Framer Motion fade-in

组件风格:
  - 按钮: 大圆角，渐变背景，hover微放大
  - 卡片: 纯白背景，细边框，hover阴影增强
  - 输入框: 极简下划线或细边框，focus蓝色 glow
  - 图表: 极简线条，蓝色渐变，无多余网格线
```

---

## 项目文件结构
```
token-saver/
├── headroom-core/          # headroom原始代码（git submodule）
├── backend/
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── core/           # 压缩核心封装
│   │   ├── models/         # 数据库模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── migrations/         # 数据库迁移
│   ├── tests/             # 测试
│   └── Dockerfile
├── frontend/
│   ├── app/               # Next.js app router
│   ├── components/        # React组件
│   │   ├── ui/           # 基础UI组件
│   │   ├── dashboard/    # Dashboard组件
│   │   └── landing/      # 落地页组件
│   ├── lib/              # 工具函数
│   ├── hooks/            # React hooks
│   ├── store/            # Zustand store
│   └── public/           # 静态资源
├── sdk/
│   ├── python/           # Python SDK
│   ├── typescript/       # TypeScript SDK
│   └── go/              # Go SDK
├── docs/                 # 文档
└── docker-compose.yml
```

---

## 风险与对策

| 风险 | 对策 |
|------|------|
| headroom更新频繁 | 用git submodule，定期同步 |
| 压缩性能问题 | 异步处理，队列削峰 |
| 用户数据安全 | 不存储原始内容，仅存储压缩后+元数据 |
| 国内合规 | 数据不出境，国内服务器部署 |
| 竞品跟进 | 快速迭代，社区运营，品牌先发 |

---

*项目启动日期: 2026-06-06*  
*项目负责人: 濠仔*  
*委托人: 鹏哥*
