"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getToken, removeToken, API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { Zap, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // 获取用户信息和API Key列表
    Promise.all([
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
    ])
      .then(([userData, keysData]) => {
        setUser(userData);
        setApiKeys(keysData || []);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败");
        setLoading(false);
      });
  }, [router]);

  async function createApiKey() {
    const token = getToken();
    if (!token) return;
    
    setCreatingKey(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api-keys`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newKeyName || "New Key" })
      });
      const data = await response.json();
      if (data.api_key) {
        setShowNewKey(data.api_key);
        setApiKeys([...apiKeys, data]);
        setNewKeyName("");
      }
    } catch (err) {
      console.error("创建API Key失败", err);
    } finally {
      setCreatingKey(false);
    }
  }

  async function deleteApiKey(id: number) {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${API_BASE_URL}/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (err) {
      console.error("删除API Key失败", err);
    }
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
            <Link href="/profile">
              <Button variant="ghost" size="sm">个人中心</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => { removeToken(); router.push("/login"); }}>
              <LogOut className="w-4 h-4 mr-1" />退出
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">用户信息</h3>
            <p className="text-sm text-muted-foreground">邮箱: {user?.email}</p>
            <p className="text-sm text-muted-foreground">套餐: {user?.plan}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">API Key 管理</h3>
            <div className="flex gap-2 mb-3">
              <Input 
                placeholder="API Key 名称" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="text-sm"
              />
              <Button size="sm" onClick={createApiKey} disabled={creatingKey}>
                {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "创建"}
              </Button>
            </div>
            {showNewKey && (
              <div className="mb-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">新 API Key 已创建（请保存）：</p>
                <code className="text-xs break-all">{showNewKey}</code>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowNewKey(null)}>知道了</Button>
              </div>
            )}
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">{key.key_prefix}...</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteApiKey(key.id)}>删除</Button>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <p className="text-sm text-muted-foreground">暂无 API Key</p>
              )}
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">快速开始</h3>
            <div className="space-y-2">
              <Link href="/docs">
                <Button variant="outline" size="sm" className="w-full">查看文档</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="w-full">升级套餐</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
