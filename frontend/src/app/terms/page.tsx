export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">服务条款</h1>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-4">最后更新日期：2026年6月8日</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. 服务说明</h2>
          <p className="mb-4">TokenSaver 提供 LLM Token 压缩服务，帮助用户降低 AI 使用成本。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. 用户责任</h2>
          <p className="mb-4">用户应合法使用本服务，不得用于违法或侵权目的。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. 免责声明</h2>
          <p className="mb-4">本服务按"现状"提供，不对压缩结果的准确性做任何保证。</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. 联系我们</h2>
          <p>如有问题请联系 support@tokensave.com</p>
        </div>
      </div>
    </div>
  );
}
