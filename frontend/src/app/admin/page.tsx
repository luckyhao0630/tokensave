"use client";

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Users, BarChart3, Zap, TrendingDown, Activity, Loader2,
  Search, Shield, LogOut, UserCheck, DollarSign, Server
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeToken, API_BASE_URL } from "@/lib/api";

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
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("tokensaver_token");
        if (!token) {
          router.push("/admin/login");
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

        if (response.status === 401) {
          router.push("/admin/login");
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
  }, [router]);

  function getApiBaseUrl(): string {
    if (typeof window === "undefined") return API_BASE_URL;
    const hostname = window.location.hostname;
    if (hostname === "tokesave.com" || hostname === "www.tokesave.com") {
      return API_BASE_URL;
    }
    if (hostname.includes("vercel.app")) {
      return API_BASE_URL;
    }
    return "http://localhost:8000/api/v1";
  }

  function handleLogout() {
    removeToken();
    router.push("/admin/login");
  }

  const filteredUsers = data?.recent_users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    pro: "bg-blue-100 text-blue-700",
    team: "bg-purple-100 text-purple-700",
    enterprise: "bg-amber-100 text-amber-700",
  };

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
        <Link href="/admin/login">
          <Button>去后台登录</Button>
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
      bgColor: "bg-blue-50",
    },
    {
      label: "总请求数",
      value: data.total_requests,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "节省Token",
      value: data.total_tokens_saved,
      icon: TrendingDown,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "节省费用",
      value: `$${data.total_cost_saved.toFixed(4)}`,
      icon: Zap,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">TokenSaver 管理后台</span>
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              <UserCheck className="w-4 h-4 inline mr-1" />
              管理员
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 rounded-2xl border-none shadow-sm bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="rounded-xl bg-white border">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="usage" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              用量统计
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-2" />
              系统状态
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">最近7天趋势</h3>
                <div className="space-y-3">
                  {data.daily_requests.map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <span className="text-sm font-medium">{day.date}</span>
                      <span className="text-sm">{day.requests} 请求</span>
                      <span className="text-sm text-green-600 font-medium">
                        {day.tokens_saved} Token
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">Top 用户</h3>
                <div className="space-y-3">
                  {data.top_users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.name || "未命名"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.request_count} 次</p>
                        <p className="text-xs text-green-600">{user.tokens_saved} Token</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">用户管理</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户邮箱或姓名..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">邮箱</th>
                      <th className="text-left py-3 px-4">姓名</th>
                      <th className="text-left py-3 px-4">套餐</th>
                      <th className="text-left py-3 px-4">注册时间</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4 font-medium">{user.email}</td>
                        <td className="py-3 px-4">{user.name || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge className={planColors[user.plan] || "bg-gray-100"}>
                            {user.plan}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">查看</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>未找到匹配的用户</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">压缩统计</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <span>平均压缩率</span>
                    <span className="text-2xl font-bold text-primary">{data.avg_compression_ratio}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <span>总请求数</span>
                    <span className="text-2xl font-bold">{data.total_requests}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <span>总节省 Token</span>
                    <span className="text-2xl font-bold text-green-600">{data.total_tokens_saved}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <span>总节省费用</span>
                    <span className="text-2xl font-bold text-amber-600">${data.total_cost_saved.toFixed(4)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">每日详情</h3>
                <div className="space-y-3">
                  {data.daily_requests.map((day) => (
                    <div
                      key={day.date}
                      className="p-4 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{day.date}</span>
                        <Badge variant="outline">{day.requests} 请求</Badge>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${Math.min(100, (day.requests / 100) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        节省 {day.tokens_saved} Token
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">系统状态</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span className="text-sm">API 服务</span>
                    <Badge className="bg-green-100 text-green-700">正常</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span className="text-sm">数据库</span>
                    <Badge className="bg-green-100 text-green-700">正常</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span className="text-sm">前端服务</span>
                    <Badge className="bg-green-100 text-green-700">正常</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">部署信息</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">前端</span>
                    <span>Vercel</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">后端</span>
                    <span>Railway</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">数据库</span>
                    <span>Neon PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">域名</span>
                    <span>tokesave.com</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4">快速操作</h3>
                <div className="space-y-3">
                  <Button className="w-full rounded-xl" variant="outline">
                    <DollarSign className="w-4 h-4 mr-2" />
                    查看收入报表
                  </Button>
                  <Button className="w-full rounded-xl" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    导出用户列表
                  </Button>
                  <Button className="w-full rounded-xl" variant="outline">
                    <Server className="w-4 h-4 mr-2" />
                    系统配置
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
