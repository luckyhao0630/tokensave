"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, BarChart3, Code, Globe, ChevronRight, CheckCircle2, Star, Clock, Sparkles } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { getToken, billingApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [promo, setPromo] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    billingApi.getPromoStatus().then(setPromo).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium">
              🚀 {t('hero.badge')}
            </Badge>
            
            {/* 限时免费活动横幅 */}
            {promo?.enabled && (
              <motion.div
                className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={() => window.location.href = '/register'}
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">{promo.name}</span>
                <span className="text-sm opacity-90">{promo.message}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            )}
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t('hero.title')}
            <br />
            <span className="text-primary">{t('hero.highlight')}</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                {t('hero.cta_primary')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                {t('hero.cta_secondary')}
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {[
              { value: 85, suffix: "%", label: t('hero.stat1') },
              { value: 10000, suffix: "+", label: t('hero.stat2') },
              { value: 50, suffix: "%", label: t('hero.stat3') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Start Guide for Beginners */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium">
              🎯 {t('home.newbie_badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.quick_start_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.quick_start_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: t("home.step1_title"),
                desc: t("home.step1_desc"),
                icon: "👤",
                action: t("home.step1_action"),
                href: "/register",
              },
              {
                step: "2",
                title: t("home.step2_title"),
                desc: t("home.step2_desc"),
                icon: "🔑",
                action: t("home.step2_action"),
                href: "/docs",
              },
              {
                step: "3",
                title: t("home.step3_title"),
                desc: t("home.step3_desc"),
                icon: "🔄",
                action: t("home.step3_action"),
                href: "/docs",
              },
              {
                step: "4",
                title: t("home.step4_title"),
                desc: t("home.step4_desc"),
                icon: "📊",
                action: t("home.step4_action"),
                href: "/dashboard",
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 border-0 shadow-sm bg-white relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <Link href={item.href}>
                  <Button variant="outline" size="sm" className="rounded-full w-full">
                    {item.action}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.features_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.features_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: t("home.sdk_title"),
                desc: t("home.sdk_desc"),
                code: "import { compress } from 'tokensaver'\nconst result = await compress(messages)",
              },
              {
                icon: Globe,
                title: t("home.proxy_title"),
                desc: t("home.proxy_desc"),
                code: "https://api.openai.com\n↓\nhttps://api.tokesave.com/proxy",
              },
              {
                icon: Shield,
                title: t("home.api_title"),
                desc: t("home.api_desc"),
                code: "POST /api/v1/compress\n{\n  messages: [...]\n}",
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border-0 shadow-none bg-white">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.desc}</p>
                <pre className="bg-secondary rounded-xl p-4 text-xs font-mono overflow-x-auto">
                  <code>{feature.code}</code>
                </pre>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compression Demo */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.compression_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.compression_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: t("home.json_array"), ratio: 90, icon: BarChart3 },
              { type: t("home.log_file"), ratio: 92, icon: Code },
              { type: t("home.search_result"), ratio: 88, icon: Zap },
              { type: t("home.html_content"), ratio: 70, icon: Globe },
            ].map((item) => (
              <Card key={item.type} className="p-6 border-0 shadow-none bg-secondary/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.type}</span>
                  </div>
                  <Badge variant="secondary" className="text-primary font-semibold">
                    -{item.ratio}%
                  </Badge>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${item.ratio}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.testimonials_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.testimonials_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Chen",
                role: t("home.testimonial1_role"),
                content: t("home.testimonial1_content"),
                rating: 5,
              },
              {
                name: "Sarah Wang",
                role: t("home.testimonial2_role"),
                content: t("home.testimonial2_content"),
                rating: 5,
              },
              {
                name: "Mike Zhang",
                role: t("home.testimonial3_role"),
                content: t("home.testimonial3_content"),
                rating: 5,
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="p-8 border-0 shadow-none bg-white">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm font-medium">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('home.pricing_simple')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.pricing_desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: t("home.free_plan_name"),
                price: "$0",
                period: "",
                desc: t("home.free_plan_desc"),
                features: [t("home.free_features")[0], t("home.free_features")[1], t("home.free_features")[2]],
                cta: promo?.enabled ? "🎉 " + t("pricing.cta_pro") : t("home.cta_start"),
                highlight: false,
              },
              {
                name: t("home.pro_plan_name"),
                price: "$19",
                period: t("pricing.period"),
                desc: t("home.pro_plan_desc"),
                features: [t("home.pro_features")[0], t("home.pro_features")[1], t("home.pro_features")[2], t("home.pro_features")[3]],
                cta: promo?.enabled ? "🎉 " + t("pricing.cta_pro") : t("home.cta_upgrade"),
                highlight: true,
              },
              {
                name: t("home.team_plan_name"),
                price: "$99",
                period: t("pricing.period"),
                desc: t("home.team_plan_desc"),
                features: [t("home.team_features")[0], t("home.team_features")[1], t("home.team_features")[2], t("home.team_features")[3]],
                cta: promo?.enabled ? "🎉 " + t("pricing.cta_pro") : t("home.cta_contact"),
                highlight: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 border-0 ${
                  plan.highlight
                    ? "bg-white shadow-xl ring-2 ring-primary"
                    : "bg-white shadow-sm"
                }`}
              >
                <div className="mb-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-full ${
                    plan.highlight ? "" : "variant-outline"
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            {t('home.cta_section_title')}
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t('home.cta_section_desc')}
          </p>
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-primary hover:bg-white/90">
              {t('home.cta_button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">TokenSaver</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 TokenSaver. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
