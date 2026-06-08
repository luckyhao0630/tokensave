"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import { useState } from "react";
import { MessageCircle, Send, CheckCircle, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "support",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://api.tokesave.com/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      alert("提交失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">消息已发送</h1>
          <p className="text-muted-foreground mb-6">
            我们已收到您的消息，会尽快回复您
          </p>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">联系我们</h1>
          <p className="text-muted-foreground">
            有任何问题或建议？我们随时为您服务
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  placeholder="您的姓名"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">类型</Label>
              <select
                id="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="support">技术支持</option>
                <option value="feedback">产品反馈</option>
                <option value="bug">Bug 报告</option>
                <option value="feature">功能建议</option>
                <option value="business">商务合作</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">主题</Label>
              <Input
                id="subject"
                placeholder="简要描述您的问题"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">详细描述</Label>
              <textarea
                id="message"
                placeholder="请详细描述您遇到的问题或建议..."
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "发送中..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发送消息
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* 邮箱说明 */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 mb-1">重要提示</p>
              <p className="text-sm text-yellow-700">
                我们尚未配置邮件服务器。如果您需要紧急联系，请直接通过上方表单提交，我们会尽快回复。
                <br />
                或添加微信/飞书客服（即将上线）。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            support@tokensave.com（目前仅作展示，请使用上方表单）
          </p>
        </div>
      </div>
    </div>
  );
}
