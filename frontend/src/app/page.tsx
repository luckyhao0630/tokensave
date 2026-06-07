"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, BarChart3, Code, Globe, ChevronRight, CheckCircle2, Star } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">TokenSaver</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">功能</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">定价</a>
            <Link href="/docs" className="hover:text-foreground transition-colors">文档</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full px-4">
                开始使用
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium">
              🚀 基于 GitHub 14k+ Stars 开源项目
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            让 LLM 费用
            <br />
            <span className="text-primary">降低 60-95%</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            智能压缩 Token，不改变 AI 回答质量。
            <br className="hidden md:block" />
            一行代码接入，立即节省一半以上成本。
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                免费开始
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                查看文档
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {[
              { value: 85, suffix: "%", label: "平均压缩率" },
              { value: 10000, suffix: "+", label: "开发者使用" },
              { value: 50, suffix: "%", label: "费用节省" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              三步接入，立省一半
            </h2>
            <p className="text-lg text-muted-foreground">
              无需改动业务逻辑，像使用 CDN 一样简单
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: "SDK 模式",
                desc: "一行代码替换 LLM Client，自动压缩所有请求",
                code: "import { compress } from 'tokensaver'\nconst result = await compress(messages)",
              },
              {
                icon: Globe,
                title: "Proxy 模式",
                desc: "修改 Base URL，零代码改动，所有请求自动压缩",
                code: "https://api.openai.com\n↓\nhttps://api.tokesave.com/proxy",
              },
              {
                icon: Shield,
                title: "API 模式",
                desc: "直接调用压缩 API，灵活集成到任何系统",
                code: "POST /api/v1/compress\n{\n  messages: [...]\n}",
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border-0 shadow-none bg-white">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.desc}</p>
                <pre className="bg-secondary rounded-xl p-4 text-xs font-mono overflow-x-auto">
                  <code>{feature.code}</code>
                </pre>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compression Demo */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              压缩效果一览
            </h2>
            <p className="text-lg text-muted-foreground">
              不同内容类型，都能大幅压缩
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: "JSON 数组", ratio: 90, icon: BarChart3 },
              { type: "日志文件", ratio: 92, icon: Code },
              { type: "搜索结果", ratio: 88, icon: Zap },
              { type: "HTML 内容", ratio: 70, icon: Globe },
            ].map((item) => (
              <Card key={item.type} className="p-6 border-0 shadow-none bg-secondary/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.type}</span>
                  </div>
                  <Badge variant="secondary" className="text-primary font-semibold">
                    -{item.ratio}%
                  </Badge>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${item.ratio}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              开发者怎么说
            </h2>
            <p className="text-lg text-muted-foreground">
              来自全球开发者的真实反馈
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Chen",
                role: "AI 应用开发者",
                content: "接入 TokenSaver 后，我们的 AI 客服成本直接降低了 70%。简单的 API 调用，没有任何学习成本。",
                rating: 5,
              },
              {
                name: "Sarah Wang",
                role: "全栈工程师",
                content: "Proxy 模式太方便了，零代码改动就能节省一半费用。Dashboard 的用量统计也很清晰。",
                rating: 5,
              },
              {
                name: "Mike Zhang",
                role: "创业公司 CTO",
                content: "对于我们这种大量使用 LLM 的初创公司，TokenSaver 每月帮我们省下几千刀，ROI 极高。",
                rating: 5,
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="p-8 border-0 shadow-none bg-white">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm font-medium">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              简单定价
            </h2>
            <p className="text-lg text-muted-foreground">
              节省的费用远超产品成本
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "免费版",
                price: "¥0",
                period: "",
                desc: "适合个人开发者体验",
                features: ["100 次/天", "基础压缩", "社区支持"],
                cta: "开始使用",
                highlight: false,
              },
              {
                name: "专业版",
                price: "¥49",
                period: "/月",
                desc: "适合个人开发者和小团队",
                features: ["无限次压缩", "高级压缩算法", "API 访问", "邮件支持"],
                cta: "立即升级",
                highlight: true,
              },
              {
                name: "团队版",
                price: "¥199",
                period: "/月",
                desc: "适合团队和企业",
                features: ["5 个成员", "团队管理", "用量统计", "优先支持"],
                cta: "联系销售",
                highlight: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 border-0 ${
                  plan.highlight
                    ? "bg-white shadow-xl ring-2 ring-primary"
                    : "bg-white shadow-sm"
                }`}
              >
                <div className="mb-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-full ${
                    plan.highlight ? "" : "variant-outline"
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            开始节省 LLM 费用
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            加入 10,000+ 开发者，用 TokenSaver 降低 AI 应用成本
          </p>
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-primary hover:bg-white/90">
              免费开始使用
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">TokenSaver</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 TokenSaver. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
