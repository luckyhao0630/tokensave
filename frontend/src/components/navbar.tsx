"use client";

import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./language-switcher";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">MediaKit</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#tools" className="hover:text-foreground transition-colors">{t('nav.features')}</a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">{t('nav.pricing')}</a>
          <Link href="/guide" className="hover:text-foreground transition-colors">{t('nav.guide')}</Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">{t('nav.docs')}</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">{t('nav.contact')}</Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full px-4">
                {t('nav.dashboard')}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-4">
                  {t('nav.start')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
