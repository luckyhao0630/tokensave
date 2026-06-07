"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const pythonCode = `import requests

# 1. 获取 API Key（在 Dashboard 创建）
API_KEY = "your-api-key-here"

# 2. 压缩请求
response = requests.post(
    "https://api.tokesave.com/api/v1/compress",
    headers={"X-API-Key": API_KEY},
    json={
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Summarize this data"}
        ]
    }
)

result = response.json()
print(f"压缩率: {result['savings_percentage']:.1f}%")
print(f"节省费用: \${result['cost_saved_usd']:.4f}")`;

  const jsCode = `const API_KEY = 'your-api-key';

const response = await fetch('https://api.tokesave.com/api/v1/compress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Summarize this data' }
    ]
  })
});

const result = await response.json();
console.log('压缩率: ' + result.savings_percentage.toFixed(1) + '%');
console.log('节省费用: $' + result.cost_saved_usd.toFixed(4));`;

  const curlCode = `curl -X POST https://api.tokesave.com/api/v1/compress \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{"messages": [{"role": "user", "content": "test"}]}'`;

  const proxyCode = `# Proxy 模式 - 零代码改动
# 将 API Base URL 替换为 TokenSaver Proxy

# OpenAI
https://api.openai.com/v1
↓
https://api.tokesave.com/proxy/openai/v1

# Anthropic
https://api.anthropic.com/v1
↓
https://api.tokesave.com/proxy/anthropic/v1

# 所有请求自动压缩，返回结果不变`;

  const codeExamples = {
    python: pythonCode,
    javascript: jsCode,
    curl: curlCode,
    proxy: proxyCode
  };

  const sidebarItems = [
    {
      title: "快速开始",
      items: [
        { label: "概述", id: "overview" },
        { label: "安装", id: "install" },
        { label: "认证", id: "auth" },
      ]
    },
    {
      title: "API 参考",
      items: [
        { label: "压缩接口", id: "compress-api" },
        { label: "Proxy 模式", id: "proxy" },
        { label: "用量统计", id: "usage" },
      ]
    },
    {
      title: "SDK",
      items: [
        { label: "Python", id: "python-sdk" },
        { label: "JavaScript", id: "js-sdk" },
        { label: "cURL", id: "curl-sdk" },
      ]
    },
    {
      title: "其他",
      items: [
        { label: "响应格式", id: "response" },
        { label: "支持模型", id: "models" },
        { label: "定价", id: "pricing" },
        { label: "快速指南", id: "quickstart" },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">TokenSaver</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full">
                开始使用
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {sidebarItems.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
                  <ul className="space-y-2 text-sm">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`transition-colors ${
                            activeSection === item.id
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Overview */}
            <section id="overview">
              <h1 className="text-3xl font-bold tracking-tight mb-4">API 文档</h1>
              <p className="text-lg text-muted-foreground mb-8">
                TokenSaver 提供简单的 REST API 和 Proxy 模式，让你可以以最少的改动集成 Token 压缩功能。
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 border-0 shadow-sm bg-white">
                  <div className="text-2xl font-bold text-primary mb-1">3</div>
                  <div className="text-sm font-medium">集成模式</div>
                  <div className="text-xs text-muted-foreground mt-1">SDK / Proxy / API</div>
                </Card>
                <Card className="p-6 border-0 shadow-sm bg-white">
                  <div className="text-2xl font-bold text-primary mb-1">60-95%</div>
                  <div className="text-sm font-medium">压缩率</div>
                  <div className="text-xs text-muted-foreground mt-1">平均节省 Token</div>
                </Card>
              </div>
            </section>

            {/* Install */}
            <section id="install" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">安装</h2>
              <p className="text-muted-foreground mb-4">使用 pip 安装 Python SDK：</p>
              <div className="bg-secondary rounded-xl p-4 font-mono text-sm">
                pip install tokensaver
              </div>
            </section>

            {/* Auth */}
            <section id="auth" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">认证</h2>
              <div className="bg-secondary rounded-xl p-4 text-sm space-y-2">
                <p>1. 注册账号 → <Link href="/login" className="text-primary">立即注册</Link></p>
                <p>2. 创建 API Key → 在 Dashboard 点击"创建新密钥"</p>
                <p>3. 在请求头添加 X-API-Key</p>
              </div>
            </section>

            {/* Code Examples */}
            <section id="code-examples" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">代码示例</h2>
              
              <Tabs defaultValue="python" className="w-full">
                <TabsList className="w-full rounded-lg bg-secondary">
                  <TabsTrigger value="python" className="rounded-md text-xs">Python</TabsTrigger>
                  <TabsTrigger value="javascript" className="rounded-md text-xs">JavaScript</TabsTrigger>
                  <TabsTrigger value="curl" className="rounded-md text-xs">cURL</TabsTrigger>
                  <TabsTrigger value="proxy" className="rounded-md text-xs">Proxy 模式</TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([key, code]) => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <div className="relative">
                      <pre className="bg-secondary rounded-xl p-4 text-xs font-mono overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(code, key)}
                      >
                        {copied === key ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            {/* API Endpoints */}
            <section id="compress-api" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">压缩接口</h2>
              
              <Card className="p-6 border-0 shadow-sm bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-mono font-semibold">POST</span>
                  <code className="text-sm font-mono">/api/v1/compress</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  压缩消息数组，返回压缩后的消息和统计信息。
                </p>
                <div className="text-xs font-mono bg-secondary rounded-lg p-3">
                  {`{
  "model": "gpt-4o",
  "messages": [...],
  "token_budget": 50000  // 可选
}`}
                </div>
              </Card>
            </section>

            <section id="proxy" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Proxy 模式</h2>
              
              <Card className="p-6 border-0 shadow-sm bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-mono font-semibold">POST</span>
                  <code className="text-sm font-mono">/api/v1/proxy/&#123;provider&#125;</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Proxy 模式，自动压缩请求并转发到指定 Provider。
                </p>
                <div className="text-xs font-mono bg-secondary rounded-lg p-3">
                  // 支持 provider: openai, anthropic, deepseek
                  POST /api/v1/proxy/openai/v1/chat/completions
                </div>
              </Card>
            </section>

            <section id="usage" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">用量统计</h2>
              
              <div className="space-y-4">
                <Card className="p-6 border-0 shadow-sm bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-mono font-semibold">GET</span>
                    <code className="text-sm font-mono">/api/v1/usage/stats</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    获取用户总体用量统计。
                  </p>
                </Card>

                <Card className="p-6 border-0 shadow-sm bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-mono font-semibold">GET</span>
                    <code className="text-sm font-mono">/api/v1/usage/daily</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    获取最近 N 天的每日用量统计。
                  </p>
                  <div className="text-xs font-mono bg-secondary rounded-lg p-3">
                    Query: ?days=7 (默认 7 天)
                  </div>
                </Card>
              </div>
            </section>

            {/* SDK Sections */}
            <section id="python-sdk" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Python SDK</h2>
              <div className="relative">
                <pre className="bg-secondary rounded-xl p-4 text-xs font-mono overflow-x-auto">
                  <code>{pythonCode}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(pythonCode, "python")}
                >
                  {copied === "python" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </section>

            <section id="js-sdk" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">JavaScript SDK</h2>
              <div className="relative">
                <pre className="bg-secondary rounded-xl p-4 text-xs font-mono overflow-x-auto">
                  <code>{jsCode}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(jsCode, "js")}
                >
                  {copied === "js" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </section>

            <section id="curl-sdk" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">cURL 示例</h2>
              <div className="relative">
                <pre className="bg-secondary rounded-xl p-4 text-xs font-mono overflow-x-auto">
                  <code>{curlCode}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(curlCode, "curl")}
                >
                  {copied === "curl" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </section>

            {/* Response Format */}
            <section id="response" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">响应格式</h2>
              
              <div className="text-xs font-mono bg-secondary rounded-xl p-6">
                <pre>{`{
  "compressed_messages": [...],  // 压缩后的消息数组
  "tokens_before": 10000,         // 原始 Token 数
  "tokens_after": 2000,           // 压缩后 Token 数
  "savings_percentage": 80.0,     // 压缩率
  "transforms_applied": [         // 应用的压缩策略
    "smart_crusher",
    "cache_aligner"
  ],
  "cost_saved_usd": 0.024         // 节省的费用（USD）
}`}</pre>
              </div>
            </section>

            {/* Supported Models */}
            <section id="models" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">支持模型</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] },
                  { name: "Anthropic", models: ["claude-3-5-sonnet", "claude-3-5-haiku", "claude-3-opus"] },
                  { name: "DeepSeek", models: ["deepseek-chat", "deepseek-coder"] },
                  { name: "Google", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
                ].map((provider) => (
                  <Card key={provider.name} className="p-6 border-0 shadow-sm bg-white">
                    <div className="font-semibold mb-3">{provider.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {provider.models.map((model) => (
                        <span key={model} className="px-2 py-1 rounded-md bg-secondary text-xs font-mono">
                          {model}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">套餐定价</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { name: "免费版", price: "$0", limit: "100次/天", features: ["基础压缩", "100次/日", "社区支持"] },
                  { name: "专业版", price: "$19", limit: "无限", features: ["无限请求", "API访问", "高级算法", "优先支持"] },
                  { name: "团队版", price: "$99", limit: "无限", features: ["5人团队", "用量看板", "专属支持", "SSO"] },
                  { name: "企业版", price: "定制", limit: "无限", features: ["无限成员", "私有部署", "SLA保障", "专属经理"] },
                ].map((plan) => (
                  <Card key={plan.name} className="p-6 border-0 shadow-sm bg-white text-center">
                    <div className="font-semibold mb-2">{plan.name}</div>
                    <div className="text-2xl font-bold text-primary mb-2">{plan.price}</div>
                    <div className="text-xs text-muted-foreground mb-4">{plan.limit}</div>
                    <ul className="text-xs text-left space-y-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" /> {f}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Start Guide */}
            <section id="quickstart" className="mt-12 mb-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">快速开始指南</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "注册账号", desc: "访问 https://tokesave.com 注册免费账号，1分钟即可完成。" },
                  { step: "2", title: "创建 API Key", desc: "在 Dashboard 点击创建新密钥，复制生成的 API Key。" },
                  { step: "3", title: "发送请求", desc: "在请求头添加 X-API-Key，发送消息到 /api/v1/compress，立即获得压缩结果。" },
                  { step: "4", title: "查看省钱统计", desc: "在 Dashboard 查看节省的 Token 数量和费用，优化你的使用策略。" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Link href="/login">
                  <Button className="rounded-full gap-2">
                    立即开始使用
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
