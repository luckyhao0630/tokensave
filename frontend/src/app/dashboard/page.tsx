import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getToken, removeToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { Zap, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // 获取用户信息
    fetch("https://tokensave-production.up.railway.app/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败");
        setLoading(false);
      });
  }, [router]);

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

  return (
    <div className="min-h-screen bg-secondary/30">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">TokenSaver</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{user?.plan || "free"}</Badge>
            <Button variant="ghost" size="sm" onClick={() => { removeToken(); router.push("/login"); }}>
              <LogOut className="w-4 h-4 mr-1" />退出
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">用户信息</h3>
            <p className="text-sm text-muted-foreground">邮箱: {user?.email}</p>
            <p className="text-sm text-muted-foreground">套餐: {user?.plan}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">API Key</h3>
            <p className="text-sm text-muted-foreground mb-3">创建 API Key 开始使用</p>
            <Button size="sm">创建 API Key</Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">快速开始</h3>
            <Link href="/docs">
              <Button variant="outline" size="sm" className="w-full">查看文档</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
