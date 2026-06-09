"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import { useState } from "react";
import { MessageCircle, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "support",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://api.tokesave.com/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      alert(t("contact.submit_error"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("contact.success")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("contact.success_desc")}
          </p>
          <Link href="/">
            <Button>{t("common.back")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t("contact.title")}</h1>
          <p className="text-muted-foreground">
            {t("contact.subtitle")}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("contact.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("contact.name_placeholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("contact.type")}</Label>
              <select
                id="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="support">{t("contact.types.support")}</option>
                <option value="feedback">{t("contact.types.feedback")}</option>
                <option value="bug">{t("contact.types.bug")}</option>
                <option value="feature">{t("contact.types.feature")}</option>
                <option value="business">{t("contact.types.business")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t("contact.subject")}</Label>
              <Input
                id="subject"
                placeholder={t("contact.subject_placeholder")}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t("contact.message")}</Label>
              <textarea
                id="message"
                placeholder={t("contact.message_placeholder")}
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                t("contact.sending")
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("contact.submit")}
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
