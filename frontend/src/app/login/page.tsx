"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, setToken } from "@/lib/api";
import { useState } from "react";
import { Zap, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await authApi.login(form.email, form.password);
        setToken(result.access_token);
        router.push("/dashboard");
      } else {
        await authApi.register(form.email, form.password, form.name);
        // 注册成功后自动登录
        const result = await authApi.login(form.email, form.password);
        setToken(result.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight">TokenSaver</span>
          </Link>
        </div>

        <Card className="p-8 rounded-2xl border-none shadow-lg bg-white">
          <h1 className="text-2xl font-semibold text-center mb-2">
            {isLogin ? "登录" : "注册"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin
              ? "欢迎回来，请登录您的账户"
              : "创建账户，开始节省 Token 费用"}
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="您的姓名"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
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
                  placeholder="至少8位字符"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isLogin ? "登录" : "注册"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">
              {isLogin ? "还没有账户？" : "已有账户？"}
            </span>{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "立即注册" : "去登录"}
            </button>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
