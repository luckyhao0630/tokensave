export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">TokenSaver</span>
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/terms" className="text-muted-foreground hover:text-foreground">服务条款</a>
            <a href="/refund" className="text-muted-foreground hover:text-foreground">退款政策</a>
            <a href="/" className="text-primary hover:underline">返回首页</a>
          </div>
        </div>
      </nav>
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
