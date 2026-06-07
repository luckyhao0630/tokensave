"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, setToken } from "@/lib/api";
import { useState } from "react";
import { Zap, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login(form.email, form.password);
      setToken(result.access_token);
      
      // 检查是否是管理员
      const meResult = await authApi.me();
      const isAdmin = meResult.email === "luckyhao0630@gmail.com" || meResult.plan === "enterprise";
      
      if (!isAdmin) {
        setError("您没有管理员权限");
        setLoading(false);
        return;
      }
      
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-semibold text-xl tracking-tight text-white">TokenSaver</span>
              <span className="text-xs text-white/60 ml-2">管理后台</span>
            </div>
          </Link>
        </div>

        <Card className="p-8 rounded-2xl border-none shadow-lg bg-white">
          <h1 className="text-2xl font-semibold text-center mb-2">
            🔐 后台登录
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            管理员专用入口，普通用户请访问
            <Link href="/login" className="text-primary hover:underline ml-1">
              前台登录
            </Link>
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">管理员邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="输入密码"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              🔐 后台登录
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">
              不是管理员？
            </span>
            <Link href="/login" className="text-sm text-primary hover:underline ml-1">
              前台登录
            </Link>
          </div>
        </Card>

        <p className="text-xs text-white/40 text-center mt-6">
          TokenSaver 管理后台 · 仅限授权管理员访问
        </p>
      </div>
    </div>
  );
}
