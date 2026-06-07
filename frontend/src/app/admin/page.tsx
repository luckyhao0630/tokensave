"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  Users,
  BarChart3,
  Zap,
  TrendingDown,
  Activity,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  total_users: number;
  total_requests: number;
  total_tokens_saved: number;
  total_cost_saved: number;
  avg_compression_ratio: number;
  daily_requests: Array<{
    date: string;
    requests: number;
    tokens_saved: number;
  }>;
  recent_users: Array<{
    id: number;
    email: string;
    name: string;
    plan: string;
    created_at: string;
  }>;
  top_users: Array<{
    id: number;
    email: string;
    name: string;
    request_count: number;
    tokens_saved: number;
  }>;
}

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("tokensaver_token");
        if (!token) {
          setError("请先登录管理员账号");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${getApiBaseUrl()}/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 403) {
          setError("需要管理员权限");
          setLoading(false);
          return;
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function getApiBaseUrl(): string {
    if (typeof window === "undefined") return "http://localhost:8000/api/v1";
    const hostname = window.location.hostname;
    if (hostname === "tokesave.com" || hostname === "www.tokesave.com") {
      return "https://api.tokesave.com/api/v1";
    }
    if (hostname.includes("vercel.app")) {
      return "https://tokensave-production.up.railway.app/api/v1";
    }
    return "http://localhost:8000/api/v1";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/login">
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "总用户数",
      value: data.total_users,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "总请求数",
      value: data.total_requests,
      icon: Activity,
      color: "text-green-600",
    },
    {
      label: "节省Token",
      value: data.total_tokens_saved,
      icon: TrendingDown,
      color: "text-amber-600",
    },
    {
      label: "节省费用",
      value: `$${data.total_cost_saved.toFixed(4)}`,
      icon: Zap,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">TokenSaver 管理后台</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">管理员</Badge>
            <Link href="/">
              <Button variant="ghost" size="sm">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 rounded-2xl border-none shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-secondary/60">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="rounded-full">
            <TabsTrigger value="users" className="rounded-full">
              用户管理
            </TabsTrigger>
            <TabsTrigger value="usage" className="rounded-full">
              用量统计
            </TabsTrigger>
            <TabsTrigger value="daily" className="rounded-full">
              每日趋势
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">最近注册用户</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">邮箱</th>
                      <th className="text-left py-2">套餐</th>
                      <th className="text-left py-2">注册时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2">{user.id}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">
                          <Badge variant="outline">{user.plan}</Badge>
                        </td>
                        <td className="py-2">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">用量Top用户</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">邮箱</th>
                      <th className="text-left py-2">请求数</th>
                      <th className="text-left py-2">节省Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">{user.request_count}</td>
                        <td className="py-2">{user.tokens_saved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">
                平均压缩率: {data.avg_compression_ratio}%
              </h3>
              <p className="text-muted-foreground">
                查看 /api/v1/admin/usage/stats 获取详细统计
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="daily">
            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">最近7天请求趋势</h3>
              <div className="space-y-3">
                {data.daily_requests.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <span>{day.date}</span>
                    <span className="font-medium">{day.requests} 请求</span>
                    <span className="text-green-600">
                      {day.tokens_saved} Token节省
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
