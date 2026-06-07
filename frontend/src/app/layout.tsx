import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenSaver - 节省 60-95% 的 LLM 费用",
  description: "智能压缩 LLM Token，让 AI 开发成本降低一半以上。支持 OpenAI、Anthropic、DeepSeek 等主流模型。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
