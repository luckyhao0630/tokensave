"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">TokenSaver</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">功能</a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">定价</a>
          <Link href="/docs" className="hover:text-foreground transition-colors">文档</Link>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full px-4">
                进入 Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-4">
                  开始使用
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
