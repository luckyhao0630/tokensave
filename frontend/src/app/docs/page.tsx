"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const pythonCode = `import requests

# 使用 API Key 压缩消息
headers = {"X-API-Key": "your-api-key"}

response = requests.post(
    "https://api.tokesave.com/api/v1/compress",
    headers=headers,
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

  const jsCode = `const response = await fetch('https://api.tokesave.com/api/v1/compress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
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
  -d '{"messages": [...]}'`;

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
            <Button size="sm" className="rounded-full">
              开始使用
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-sm mb-3">快速开始</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-primary font-medium">概述</li>
                  <li className="text-muted-foreground">安装</li>
                  <li className="text-muted-foreground">认证</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-3">API 参考</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">压缩接口</li>
                  <li className="text-muted-foreground">Proxy 模式</li>
                  <li className="text-muted-foreground">用量统计</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-3">SDK</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">Python</li>
                  <li className="text-muted-foreground">JavaScript/TypeScript</li>
                  <li className="text-muted-foreground">Go</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Overview */}
            <section>
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
                  <div className="text-2xl font-bold text-primary mb-1">&lt;10ms</div>
                  <div className="text-sm font-medium">响应延迟</div>
                  <div className="text-xs text-muted-foreground mt-1">平均压缩处理时间</div>
                </Card>
              </div>
            </section>

            {/* Code Examples */}
            <section>
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
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">API 端点</h2>
              
              <div className="space-y-4">
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

                <Card className="p-6 border-0 shadow-sm bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-mono font-semibold">POST</span>
                    <code className="text-sm font-mono">/api/v1/proxy/&#123;provider&#125;</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Proxy 模式，自动压缩请求并转发到指定 Provider。
                  </p>
                  <div className="text-xs font-mono bg-secondary rounded-lg p-3">
                    // 支持 provider: openai, anthropic, deepseek, gemini
                    POST /api/v1/proxy/openai/v1/chat/completions
                  </div>
                </Card>

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

            {/* Response Format */}
            <section>
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
            <section>
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
          </div>
        </div>
      </div>
    </div>
  );
}