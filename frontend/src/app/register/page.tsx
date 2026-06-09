"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(email, password);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">TokenSaver</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 border-0 shadow-sm bg-white">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">{t("register.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("register.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full rounded-full h-11 opacity-50 cursor-not-allowed" disabled>
              {t("register.github_signup")}
            </Button>
            <Button variant="outline" className="w-full rounded-full h-11 opacity-50 cursor-not-allowed" disabled>
              <Mail className="w-4 h-4 mr-2" />
              {t("register.google_signup")}
            </Button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t("register.or_email")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-xl h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("login.password_placeholder")}
                className="rounded-xl h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                {t("register.agree")}{" "}
                <Link href="/terms" className="text-primary hover:underline">{t("footer.terms")}</Link>
                {" "}、{" "}
                <Link href="/privacy" className="text-primary hover:underline">{t("footer.privacy")}</Link>
                {" "}{t("register.and")}{" "}
                <Link href="/refund" className="text-primary hover:underline">{t("footer.refund")}</Link>
              </label>
            </div>

            <Button className="w-full rounded-full h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("register.submit")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("login.has_account")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("login.go_login")}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
