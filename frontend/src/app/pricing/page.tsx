"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { billingApi, getToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { Zap, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

interface Plan {
  name: string;
  price: number;
  price_usd: number;
  daily_limit: number;
  monthly_limit: number;
  max_tokens_per_request: number;
  api_access: boolean;
  team_seats: number;
  features: string[];
  stripe_price_ids?: {
    monthly: string;
    yearly: string;
  };
}

interface PlansData {
  plans: Record<string, Plan>;
  currency: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    async function loadPlans() {
      try {
        console.log("[Pricing] Loading plans...");
        const data = await billingApi.getPlans();
        console.log("[Pricing] Plans loaded:", data);
        setPlans(data);
      } catch (err: any) {
        console.error("[Pricing] Failed to load plans:", err);
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  async function handleCheckout(plan: string) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setCheckoutLoading(plan);
    try {
      const result = await billingApi.createCheckout(plan, interval);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (err: any) {
      alert(err.message || "创建支付失败");
    } finally {
      setCheckoutLoading(null);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            刷新重试
          </button>
        </div>
      </div>
    );
  }

  const planList = plans?.plans || {};

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            选择适合您的方案
          </h1>
          <p className="text-lg text-muted-foreground">
            从个人开发者到企业团队，我们为每个阶段提供支持
          </p>

          {/* Interval Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setInterval("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                interval === "monthly"
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground"
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                interval === "yearly"
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground"
              }`}
            >
              年付
              <Badge variant="secondary" className="ml-2 text-xs">
                省20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(planList).map(([key, plan]) => (
            <Card
              key={key}
              className={`p-6 rounded-2xl border-none shadow-sm ${
                key === "pro"
                  ? "bg-primary/5 ring-2 ring-primary"
                  : "bg-white"
              }`}
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {key === "free"
                    ? "个人开发者试用"
                    : key === "pro"
                    ? "个人开发者"
                    : key === "team"
                    ? "小团队"
                    : "企业"}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-semibold">
                  ¥{interval === "yearly" ? Math.round(plan.price * 0.8) : plan.price}
                </span>
                <span className="text-muted-foreground">/月</span>
                {interval === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    年付 ¥{Math.round(plan.price * 0.8 * 12)}/年
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full rounded-full"
                variant={key === "pro" ? "default" : "outline"}
                disabled={checkoutLoading === key || key === "enterprise"}
                onClick={() => handleCheckout(key)}
              >
                {checkoutLoading === key && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {key === "free"
                  ? "免费使用"
                  : key === "enterprise"
                  ? "联系销售"
                  : "开始试用"}
              </Button>

              {key === "pro" && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  7天免费试用，随时取消
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
