import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from "@/components/i18n-provider";

export const metadata: Metadata = {
  title: "TokenSaver - Reduce LLM Costs by 60-95%",
  description: "Smart LLM Token Compression. Reduce AI development costs by half. Supports OpenAI, Anthropic, DeepSeek and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
