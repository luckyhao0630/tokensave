"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getToken, removeToken, API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { User, Zap, LogOut, Key, CreditCard, Loader2, Eye, EyeOff, Copy, Check, MessageSquare } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
}

interface UsageStats {
  total_requests: number;
  total_tokens_before: number;
  total_tokens_after: number;
  total_tokens_saved: number;
  total_cost_saved: number;
  avg_compression_ratio: number;
  quota: {
    daily: { current: number; limit: number; remaining: number };
    monthly: { current: number; limit: number; remaining: number };
    plan: string;
  };
}

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [feedbackMessages, setFeedbackMessages] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [userRes, statsRes, keysRes] = await Promise.all([
          fetch(`${getApiBaseUrl()}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${getApiBaseUrl()}/usage/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${getApiBaseUrl()}/api-keys`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          setName(userData.name || "");
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          setApiKeys(keysData || []);
        }
        
        // 加载用户反馈
        const feedbackRes = await fetch(`${getApiBaseUrl()}/contact/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setFeedbackMessages(feedbackData || []);
        }
      } catch (error) {
        console.error("Load failed", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
        alert("密码{t('profile.change')}成功，请重新登录");
        removeToken();
        router.push("/login");
      } else {
        const error = await response.json();
        alert(error.detail || t("profile.password_change_failed"));
      }
    } catch (error) {
      alert("密码{t('profile.change')}失败");
    } finally {
      setSaving(false);
    }
  }

  async function createApiKey() {
    const token = getToken();
    if (!token) return;
    
    setCreatingKey(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api-keys`, {
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
      console.error("Create API Key failed", err);
    } finally {
      setCreatingKey(false);
    }
  }

  async function deleteApiKey(id: number) {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${getApiBaseUrl()}/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (err) {
      console.error("Delete API Key failed", err);
    }
  }

  function copyToClipboard(text: string, id: number) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
    free: t("pricing.free"),
    pro: t("pricing.pro"),
    team: t("pricing.team"),
    enterprise: t("pricing.enterprise"),
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
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">{t("profile.title")}</h1>

        {/* {t('profile.basic_info')} */}
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
              <Label htmlFor="name">{t('profile.name')}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="{t('profile.name_placeholder')}"
                  className="rounded-xl"
                />
                <Button onClick={handleUpdateName} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "{t('profile.save')}"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 用量统计 */}
        {stats && (
          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('profile.usage_stats')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{stats.total_requests}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.total_requests')}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{stats.total_tokens_saved}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.tokens_saved')}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">${stats.total_cost_saved.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.cost_saved')}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{stats.avg_compression_ratio}%</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.compression_ratio')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('profile.daily_usage')} ({stats.quota.daily.current}/{stats.quota.daily.limit === -1 ? '∞' : stats.quota.daily.limit})</span>
                <span>{stats.quota.daily.remaining > 0 ? `${stats.quota.daily.remaining} {t('profile.remaining')}` : '已超限'}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{width: `${Math.min((stats.quota.daily.current / (stats.quota.daily.limit || 1)) * 100, 100)}%`}}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('profile.monthly_usage')} ({stats.quota.monthly.current}/{stats.quota.monthly.limit === -1 ? '∞' : stats.quota.monthly.limit})</span>
                <span>{stats.quota.monthly.remaining > 0 ? `${stats.quota.monthly.remaining} {t('profile.remaining')}` : '已超限'}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{width: `${Math.min((stats.quota.monthly.current / (stats.quota.monthly.limit || 1)) * 100, 100)}%`}}
                />
              </div>
            </div>
          </Card>
        )}

        {/* {t('dashboard.api_key_mgmt')} */}
        <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('dashboard.api_key_mgmt')}
          </h3>
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="{t('dashboard.api_key_name')}" 
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="text-sm rounded-xl"
            />
            <Button size="sm" onClick={createApiKey} disabled={creatingKey} className="rounded-xl">
              {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "{t('dashboard.create')}"}
            </Button>
          </div>
          
          {showNewKey && (
            <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 mb-2 font-medium">🎉 新 API Key 已{t('dashboard.create')}！请立即复制{t('profile.save')}，只显示一次：</p>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <code className="text-sm break-all flex-1">{showNewKey}</code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(showNewKey, -1)}
                >
                  {copiedId === -1 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-2" 
                onClick={() => setShowNewKey(null)}
              >
                已{t('profile.save')}，关闭
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground">{key.key_prefix}...</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => copyToClipboard(key.key_prefix + '...', key.id)}
                  >
                    {copiedId === key.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteApiKey(key.id)}>
                    {t('dashboard.delete')}
                  </Button>
                </div>
              </div>
            ))}
            {apiKeys.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">暂无 API Key，点击上方{t('dashboard.create')}按钮</p>
            )}
          </div>
        </Card>

        {/* 意见反馈 */}
        <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('profile.feedback')}
            <Link href="/contact">
              <Button size="sm" variant="outline" className="ml-2 rounded-full">提交新反馈</Button>
            </Link>
          </h3>
          <div className="space-y-3">
            {feedbackMessages.length > 0 ? (
              feedbackMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{msg.subject}</span>
                      <Badge variant={msg.status === 'replied' ? 'default' : 'secondary'} className="text-xs">
                        {msg.status === 'replied' ? '{t('profile.replied')}' : msg.status === 'new' ? '待处理' : '已关闭'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{msg.message}</p>
                  {msg.reply && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">{t('profile.admin_reply')}：</p>
                      <p className="text-sm text-green-800">{msg.reply}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('profile.no_feedback')}
              </p>
            )}
          </div>
        </Card>

        {/* {t('profile.change_password')} */}
        <Card className="p-6 rounded-2xl border-none shadow-sm bg-white mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('profile.change_password')}
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current">{t('profile.current_password')}</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new">{t('profile.new_password')}</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm">确认{t('profile.new_password')}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={saving} className="w-full rounded-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "{t('profile.change_password')}"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
