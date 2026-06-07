"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedNumber } from "@/components/animated-number";
import { compressionApi, billingApi, apiKeyApi, getToken, removeToken } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Zap, TrendingDown, BarChart3, Key, Copy, RefreshCw,
  ArrowUpRight, ChevronRight, Loader2, User, LogOut, Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ApiKeyItem {
  id: number;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

interface StatsData {
  total_requests: number;
  total_tokens_before: number;
  total_tokens_after: number;
  total_tokens_saved: number;
  total_cost_saved: number;
  avg_compression_ratio: number;
  quota?: {
    daily: { current: number; limit: number; remaining: number };
    monthly: { current: number; limit: number; remaining: number };
    plan: string;
  };
}

interface PlanData {
  plan: string;
  plan_name: any;
  daily_limit: number;
  monthly_limit: number;
  api_access: boolean;
  usage: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const token = getToken();
        if (!token) {
          setError("请先登录");
          setLoading(false);
          return;
        }

        const [statsData, planData, keysData] = await Promise.all([
          compressionApi.getStats().catch(() => null),
          billingApi.getCurrentPlan().catch(() => null),
          apiKeyApi.list().catch(() => []),
        ]);

        setStats(statsData);
        setPlan(planData);
        setApiKeys(keysData || []);
      } catch (err: any) {
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleCreateKey() {
    setCreatingKey(true);
    try {
      const result = await apiKeyApi.create("生产环境");
      if (result.api_key) {
        alert(`API Key 创建成功: ${result.api_key}\n\n请立即复制保存，此Key只显示一次！`);
        const keys = await apiKeyApi.list();
        setApiKeys(keys || []);
      }
    } catch (err: any) {
      alert("创建失败: " + err.message);
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleDeleteKey(id: number) {
    if (!confirm("确定删除此 API Key？")) return;
    try {
      await apiKeyApi.delete(id);
      const keys = await apiKeyApi.list();
      setApiKeys(keys || []);
    } catch (err: any) {
      alert("删除失败: " + err.message);
    }
  }

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    alert("API Key 已复制到剪贴板");
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

  const statsCards = [
    {
      label: "今日节省 Token",
      value: stats?.total_tokens_saved || 0,
      suffix: "",
      change: `${stats?.avg_compression_ratio || 0}% 平均压缩率`,
      icon: TrendingDown,
      color: "text-green-600",
    },
    {
      label: "总请求次数",
      value: stats?.total_requests || 0,
      suffix: "",
      change: "累计",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      label: "节省费用",
      value: Math.round((stats?.total_cost_saved || 0) * 100),
      suffix: "$",
      prefix: "$",
      change: "USD",
      icon: Zap,
      color: "text-amber-600",
    },
    {
      label: "剩余配额",
      value: stats?.quota?.daily?.remaining || 0,
      suffix: "",
      change: `${stats?.quota?.daily?.current || 0}/${stats?.quota?.daily?.limit || 0} 已用`,
      icon: Key,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
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
            <Badge variant="secondary" className="rounded-full">
              {plan?.plan === "pro" ? "专业版" : plan?.plan === "team" ? "团队版" : plan?.plan === "enterprise" ? "企业版" : "免费版"}
            </Badge>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
              >
                <User className="w-4 h-4" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border/50 py-2">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-secondary/50 text-sm">
                    <Settings className="w-4 h-4" /> 个人设置
                  </Link>
                  <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 hover:bg-secondary/50 text-sm">
                    <Zap className="w-4 h-4" /> 升级套餐
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-secondary/50 text-sm w-full text-left text-red-600"
                  >
                    <LogOut className="w-4 h-4" /> 退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, i) => (
            <Card key={i} className="p-6 rounded-2xl border-none shadow-sm bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-secondary/60">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.prefix || ""}
                  <AnimatedNumber value={stat.value} duration={1.5} className="tabular-nums" />
                  {stat.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Keys */}
          <Card className="lg:col-span-2 p-6 rounded-2xl border-none shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">API Keys</h3>
                <p className="text-sm text-muted-foreground mt-1">管理您的 API 访问密钥</p>
              </div>
              <Button
                size="sm"
                className="rounded-full gap-2"
                onClick={handleCreateKey}
                disabled={creatingKey}
              >
                {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                创建新密钥
              </Button>
            </div>
            <div className="space-y-3">
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>暂无 API Key，点击上方按钮创建</p>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white border border-border/50">
                        <Key className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{apiKey.name || "Default"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border border-border/50">
                            {apiKey.key_prefix || "ts_..."}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {apiKey.is_active ? "活跃" : "已禁用"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {apiKey.last_used_at ? "最近使用: " + new Date(apiKey.last_used_at).toLocaleDateString() : "未使用"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg"
                        onClick={() => handleDeleteKey(apiKey.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Start */}
          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">快速接入</h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "获取 API Key", desc: "点击上方创建按钮" },
                { step: "2", title: "安装 SDK", desc: "pip install tokensaver" },
                { step: "3", title: "替换 base_url", desc: "https://api.tokesave.com/api/v1" },
                { step: "4", title: "自动压缩", desc: "零代码改动，省钱60-95%" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/docs">
              <Button className="w-full mt-6 rounded-full gap-2" variant="outline">
                查看完整文档
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Usage Chart & Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">用量趋势</h3>
            <p className="text-sm text-muted-foreground">最近7天 Token 节省趋势</p>
            <div className="mt-4 h-48 flex items-end gap-2">
              {[65, 78, 52, 89, 73, 95, 82].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/10 rounded-t-lg relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">代码示例</h3>
              <Tabs defaultValue="python" className="w-auto">
                <TabsList className="rounded-full h-8">
                  <TabsTrigger value="python" className="text-xs rounded-full px-3">Python</TabsTrigger>
                  <TabsTrigger value="js" className="text-xs rounded-full px-3">JS</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TabsContent value="python" className="mt-0">
              <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`import requests

# 1. 获取 API Key（在 Dashboard 创建）
API_KEY = "your-api-key-here"

# 2. 压缩请求
response = requests.post(
    "https://api.tokesave.com/api/v1/compress",
    headers={"X-API-Key": API_KEY},
    json={
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": your_data}]
    }
)

result = response.json()
print(f"压缩率: {result['savings_percentage']:.1f}%")
print(f"节省: ${result['cost_saved_usd']:.4f}")`}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="js" className="mt-0">
              <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`const API_KEY = 'your-api-key';

const response = await fetch('https://api.tokesave.com/api/v1/compress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{role: 'user', content: data}]
  })
});

const result = await response.json();
console.log('压缩率:', result.savings_percentage + '%');`}</code>
                </pre>
              </div>
            </TabsContent>
            <Button className="w-full mt-4 rounded-full" variant="secondary" onClick={() => {
              const code = `import requests\nAPI_KEY = "your-api-key"\nresponse = requests.post("https://api.tokesave.com/api/v1/compress", headers={"X-API-Key": API_KEY}, json={"model": "gpt-4o", "messages": []})`;
              navigator.clipboard.writeText(code);
              alert("代码已复制");
            }}>
              复制代码
            </Button>
          </Card>
        </div>

        {/* Upgrade CTA */}
        <Card className="mt-6 p-8 rounded-2xl border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">升级到专业版</h3>
              <p className="text-sm text-muted-foreground mt-1">
                解锁无限请求、API 访问、高级压缩算法
              </p>
            </div>
            <Link href="/pricing">
              <Button className="rounded-full gap-2">
                查看定价
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
