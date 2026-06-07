"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getToken, removeToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Zap, LogOut, Key, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setName(userData.name || "");
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function getApiBaseUrl(): string {
    if (typeof window === "undefined") return "https://tokensave-production.up.railway.app/api/v1";
    const hostname = window.location.hostname;
    if (hostname === "tokesave.com" || hostname === "www.tokesave.com") {
      return "https://tokensave-production.up.railway.app/api/v1";
    }
    if (hostname.includes("vercel.app")) {
      return "https://tokensave-production.up.railway.app/api/v1";
    }
    return "http://localhost:8000/api/v1";
  }

  async function handleUpdateName() {
    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        alert("姓名更新成功");
        const userData = await response.json();
        setUser(userData);
      } else {
        alert("更新失败");
      }
    } catch (error) {
      alert("更新失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    if (newPassword.length < 8) {
      alert("密码至少8位");
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`${getApiBaseUrl()}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        alert("密码修改成功，请重新登录");
        removeToken();
        router.push("/login");
      } else {
        const error = await response.json();
        alert(error.detail || "密码修改失败");
      }
    } catch (error) {
      alert("密码修改失败");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const planNames: Record<string, string> = {
    free: "免费版",
    pro: "专业版",
    team: "团队版",
    enterprise: "企业版",
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">TokenSaver</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">个人中心</h1>

        {/* 基本信息 */}
        <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user.name || user.email}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {planNames[user.plan] || user.plan}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">显示名称</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="您的姓名"
                  className="rounded-xl"
                />
                <Button onClick={handleUpdateName} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "保存"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 修改密码 */}
        <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            修改密码
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current">当前密码</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new">新密码</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm">确认新密码</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              修改密码
            </Button>
          </div>
        </Card>

        {/* 账号管理 */}
        <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            账号管理
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-sm">当前套餐</p>
                <p className="text-xs text-muted-foreground">{planNames[user.plan] || user.plan}</p>
              </div>
              <Link href="/pricing">
                <Button variant="outline" size="sm">升级</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-sm">注册时间</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 退出登录 */}
        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  );
}
