"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { billingApi, getToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { Zap, Check, Loader2, ArrowLeft, Sparkles, Clock, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { useTranslation } from "react-i18next";

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
}

interface PlansData {
  plans: Record<string, Plan>;
  currency: string;
}

export default function PricingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [promo, setPromo] = useState<any>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        console.log("[Pricing] Loading plans...");
        const data = await billingApi.getPlans();
        console.log("[Pricing] Plans loaded:", data);
        setPlans(data);
      } catch (err: any) {
        console.error("[Pricing] Failed to load plans:", err);
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
    billingApi.getPromoStatus().then(setPromo).catch(() => {});
  }, [t]);

  async function handleCheckout(plan: string) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // 限时免费期间，直接跳转到Dashboard
    if (promo?.enabled) {
      router.push("/dashboard");
      return;
    }

    setCheckoutLoading(plan);
    try {
      const result = await billingApi.createCheckout(plan, interval);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (err: any) {
      alert(err.message || t("pricing.checkout_error"));
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
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  const planList = plans?.plans || {};

  const planDescKeys: Record<string, string> = {
    free: t("pricing.free_desc"),
    pro: t("pricing.pro_desc"),
    team: t("pricing.team_desc"),
    enterprise: t("pricing.enterprise_desc"),
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 限时免费活动横幅 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
            <PartyPopper className="w-5 h-5" />
            <span className="font-semibold">🎉 {t("promo.title")}</span>
            <span className="text-sm opacity-90">{t("promo.message")}</span>
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            {t("pricing.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("pricing.subtitle")}
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
              {t("pricing.monthly")}
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                interval === "yearly"
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground"
              }`}
            >
              {t("pricing.yearly")}
              <Badge variant="secondary" className="ml-2 text-xs">
                {t("pricing.save")}
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
                  {planDescKeys[key] || ""}
                </p>
              </div>

              <div className="mb-6">
                {/* 原价（淡色删除线） */}
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-semibold">
                    ${interval === "yearly" ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-muted-foreground">/月</span>
                </div>
                {/* 限时免费提示 */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through opacity-50">
                    ${interval === "yearly" ? Math.round(plan.price * 0.8) : plan.price}/月
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {t("pricing.limited_free")}
                  </Badge>
                </div>
                {interval === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    {t("pricing.yearly_price", { price: Math.round(plan.price * 0.8 * 12) })}
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
                disabled={checkoutLoading === key}
                onClick={() => handleCheckout(key)}
              >
                {checkoutLoading === key && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {key === "free"
                  ? t("pricing.cta_free")
                  : t("pricing.cta_pro")}
              </Button>

              {key === "pro" && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  {t("pricing.trial")}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
