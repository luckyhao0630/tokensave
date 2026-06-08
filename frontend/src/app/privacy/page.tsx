import Navbar from "@/components/navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">隐私政策</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-4">最后更新日期：2026年6月8日</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. 信息收集</h2>
          <p className="mb-4">我们收集用户邮箱、使用统计等必要信息以提供服务。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. 信息使用</h2>
          <p className="mb-4">收集的信息仅用于提供服务、改进产品和用户支持。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. 数据安全</h2>
          <p className="mb-4">我们采用行业标准的安全措施保护用户数据。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. 第三方服务</h2>
          <p className="mb-4">我们使用 Paddle 处理支付，不存储信用卡信息。Paddle 负责处理全球税务合规。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. 联系我们</h2>
          <p className="mb-4">如有隐私问题请联系：</p>
          <div className="flex items-center gap-3">
            <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              联系客服
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
