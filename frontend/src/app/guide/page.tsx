"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, ChevronRight, BookOpen, Code, Zap, Terminal, Globe } from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: "注册账号",
      desc: "点击首页「开始使用」，输入邮箱和密码，30秒完成注册",
      code: "// 无需代码，浏览器打开 https://www.tokesave.com/register",
    },
    {
      step: 2,
      title: "获取 API Key",
      desc: "登录后进入 Dashboard → 创建 API Key → 复制生成的 Key",
      code: `// 登录后访问 Dashboard
// https://www.tokesave.com/dashboard
// 
// 点击「创建 API Key」
// 复制类似: ts_xxxxxxxx_xxxxxxxxxxxxx`,
    },
    {
      step: 3,
      title: "替换 API 地址",
      desc: "将原有 AI 服务的 API 地址替换为 TokenSaver 的代理地址",
      code: `// 原来的 OpenAI API 地址
https://api.openai.com/v1/chat/completions

// 替换为 TokenSaver 代理地址
https://api.tokesave.com/proxy/openai/v1/chat/completions`,
    },
    {
      step: 4,
      title: "添加 API Key 请求头",
      desc: "在 HTTP 请求头中添加 X-API-Key",
      code: `// Python 示例
headers = {
    "Authorization": "Bearer your-openai-key",  // 你的 OpenAI Key
    "X-API-Key": "ts_xxxxxxxx_xxxxxxxxxxxxx",     // TokenSaver Key
    "Content-Type": "application/json",
}`,
    },
  ];

  const providers = [
    { name: "OpenAI", url: "https://api.tokesave.com/proxy/openai/v1/chat/completions", icon: "🤖" },
    { name: "Anthropic", url: "https://api.tokesave.com/proxy/anthropic/v1/messages", icon: "📝" },
    { name: "DeepSeek", url: "https://api.tokesave.com/proxy/deepseek/v1/chat/completions", icon: "🔍" },
    { name: "OpenRouter", url: "https://api.tokesave.com/proxy/openrouter/v1/chat/completions", icon: "🌐" },
  ];

  const fullExample = `import requests
import os

# 1. 配置
API_KEY = os.getenv("TOKESAVER_API_KEY", "ts_xxxxxxxx_xxxxxxxxxxxxx")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "sk-xxxxxxxx")

# 2. 准备请求数据
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "帮我总结一下这份报告..." + " " * 1000}
]

# 3. 发送请求（通过 TokenSaver 代理）
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

# 4. 查看节省了多少
# 响应头会包含:
# X-Tokens-Before: 1500
# X-Tokens-After: 800
# X-Tokens-Saved: 700
# X-Compression-Ratio: 46.7%
# X-Cost-Saved-USD: 0.0175

print(f"AI回复: {result['choices'][0]['message']['content']}")`;

  const nodeExample = `const axios = require('axios');

const API_KEY = process.env.TOKESAVER_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function chatWithAI() {
  const response = await axios.post(
    'https://api.tokesave.com/proxy/openai/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: '帮我写一段代码...' }
      ]
    },
    {
      headers: {
        'Authorization': \`Bearer \${OPENAI_KEY}\`,
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      }
    }
  );

  console.log('AI回复:', response.data.choices[0].message.content);
  
  // 查看压缩信息
  console.log('压缩前:', response.headers['x-tokens-before']);
  console.log('压缩后:', response.headers['x-tokens-after']);
  console.log('节省:', response.headers['x-tokens-saved']);
}`;

  const curlExample = `curl -X POST https://api.tokesave.com/proxy/openai/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-openai-key" \\
  -H "X-API-Key: ts-your-tokensaver-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'`;

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">完整操作手册</h1>
          <p className="text-lg text-muted-foreground">
            从注册到对接，手把手教你使用 TokenSaver
          </p>
        </div>

        {/* 4 Steps */}
        <div className="space-y-8 mb-16">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            4步接入
          </h2>

          {steps.map((s) => (
            <Card key={s.step} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">{s.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-muted-foreground mb-4">{s.desc}</p>
                  <div className="relative bg-secondary rounded-xl p-4">
                    <pre className="text-sm font-mono overflow-x-auto">{s.code}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copy(s.code, `step${s.step}`)}
                    >
                      {copied === `step${s.step}` ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Provider URLs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            支持的 AI 服务商
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <Card key={p.name} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono break-all">{p.url}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Full Examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Code className="w-6 h-6 text-primary" />
            完整代码示例
          </h2>

          {/* Python */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Python</Badge>
            </div>
            <div className="relative bg-secondary rounded-xl p-4">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">{fullExample}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copy(fullExample, "python")}
              >
                {copied === "python" ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* Node.js */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Node.js</Badge>
            </div>
            <div className="relative bg-secondary rounded-xl p-4">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">{nodeExample}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copy(nodeExample, "node")}
              >
                {copied === "node" ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* cURL */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">cURL</Badge>
            </div>
            <div className="relative bg-secondary rounded-xl p-4">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">{curlExample}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copy(curlExample, "curl")}
              >
                {copied === "curl" ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">常见问题</h2>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Q: 我需要修改现有代码吗？</h3>
              <p className="text-muted-foreground">只需要改 2 处：API 地址 + 添加 X-API-Key 请求头。其他代码完全不变。</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Q: 压缩后会影响 AI 回答质量吗？</h3>
              <p className="text-muted-foreground">不会。我们只压缩冗余信息（重复日志、JSON默认值、HTML标签等），保留所有关键内容和语义。</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Q: 免费版和付费版有什么区别？</h3>
              <p className="text-muted-foreground">免费版：100次/天，基础压缩。付费版：无限请求，高级压缩算法（代码/HTML/CSV），API Key 访问。</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Q: 限时免费活动什么时候结束？</h3>
              <p className="text-muted-foreground">2026年7月8日结束。活动期内所有用户免费体验 Pro 版全部功能。</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Q: 支持哪些编程语言？</h3>
              <p className="text-muted-foreground">任何支持 HTTP 请求的语言都可以。提供 Python、Node.js、Go、Rust 示例代码。</p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">准备好了？</h2>
          <p className="text-muted-foreground mb-6">
            5 分钟完成对接，立即节省 60-95% 的 Token 费用
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8">
                免费开始
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                <Terminal className="w-5 h-5 mr-2" />
                API 文档
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
