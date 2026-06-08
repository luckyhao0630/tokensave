import Navbar from "@/components/navbar";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">退款政策</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-4">最后更新日期：2026年6月8日</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. 退款期限</h2>
          <p className="mb-4">我们提供 7 天无理由退款保障。如果您在购买后 7 天内对服务不满意，可申请全额退款。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. 退款条件</h2>
          <p className="mb-4">符合以下条件可申请退款：</p>
          <ul className="list-disc pl-6 mb-4">
            <li>购买后 7 天内申请</li>
            <li>未使用超过 100 次 API 调用</li>
            <li>未违反服务条款</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. 退款流程</h2>
          <p className="mb-4">发送退款申请至 support@tokensave.com，包含您的账户邮箱和购买凭证。我们将在 3-5 个工作日内处理。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. 退款方式</h2>
          <p className="mb-4">退款将原路返回至您的支付账户，处理时间取决于支付渠道，通常为 5-10 个工作日。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. 联系我们</h2>
          <p className="mb-4">退款问题请联系：</p>
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
