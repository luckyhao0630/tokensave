/**
 * TokenSaver API Client
 * 连接后端 FastAPI 服务
 */

/**
 * TokenSaver API Client
 * 连接后端 FastAPI 服务
 */

// 自动检测 API 地址
function getApiBaseUrl(): string {
  if (typeof window === "undefined") return "https://api.tokesave.com/api/v1";
  
  const hostname = window.location.hostname;
  
  // 生产环境使用 api.tokesave.com
  if (hostname === "tokesave.com" || hostname === "www.tokesave.com") {
    return "https://api.tokesave.com/api/v1";
  }
  
  // Vercel 预览环境
  if (hostname.includes("vercel.app")) {
    return "https://tokensave-production.up.railway.app/api/v1";
  }
  
  // 本地开发
  return "http://localhost:8000/api/v1";
}

const API_BASE_URL = getApiBaseUrl();

// 存储 token
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tokensaver_token");
}

function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("tokensaver_token", token);
}

function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tokensaver_token");
}

function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tokensaver_api_key");
}

// 通用请求封装
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// 认证 API
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: new URLSearchParams({ username: email, password }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),

  refresh: (refreshToken: string) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  me: () => apiRequest("/auth/me"),
};

// 压缩 API
export const compressionApi = {
  compress: (messages: Array<{ role: string; content: string }>, model?: string) =>
    apiRequest("/compress", {
      method: "POST",
      body: JSON.stringify({ messages, model: model || "gpt-4o" }),
    }),

  getStats: () => apiRequest("/usage/stats"),

  getDailyUsage: (days?: number) =>
    apiRequest(`/usage/daily${days ? `?days=${days}` : ""}`),
};

// API Key 管理
export const apiKeyApi = {
  list: () => apiRequest("/api-keys"),
  create: (name?: string) =>
    apiRequest("/api-keys", {
      method: "POST",
      body: JSON.stringify({ name: name || "New Key" }),
    }),
  delete: (id: number) =>
    apiRequest(`/api-keys/${id}`, {
      method: "DELETE",
    }),
};

// 套餐 & 计费
export const billingApi = {
  getPlans: () => apiRequest("/plans"),
  getCurrentPlan: () => apiRequest("/billing/current"),
  createCheckout: (plan: string, interval: string = "monthly") =>
    apiRequest("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, interval }),
    }),
  createPortal: () => apiRequest("/billing/portal"),
  cancel: () =>
    apiRequest("/billing/cancel", {
      method: "POST",
    }),
};

// 导出工具
export { getToken, setToken, removeToken, getApiKey, API_BASE_URL };
