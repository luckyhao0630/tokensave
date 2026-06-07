import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Mail } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
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
            <h1 className="text-2xl font-bold tracking-tight mb-2">创建账户</h1>
            <p className="text-sm text-muted-foreground">
              开始免费使用 TokenSaver，节省 LLM 费用
            </p>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full rounded-full h-11">
              使用 GitHub 注册
            </Button>

            <Button variant="outline" className="w-full rounded-full h-11">
              <Mail className="w-4 h-4 mr-2" />
              使用 Google 注册
            </Button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">或使用邮箱</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少 8 位字符"
                className="rounded-xl h-11"
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                我同意{" "}
                <Link href="#" className="text-primary hover:underline">服务条款</Link>
                {" "}和{" "}
                <Link href="#" className="text-primary hover:underline">隐私政策</Link>
              </label>
            </div>

            <Button className="w-full rounded-full h-11">
              创建账户
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            已有账户？{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
