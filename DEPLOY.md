# TokenSaver 海外部署指南

**部署组合**: Vercel(前端) + Railway(后端) + Neon(数据库) + Cloudflare(DNS)

**预计成本**: $0-5/月（免费层够用）

---

## 第一步：Neon 数据库（5分钟）

1. 访问 https://neon.tech
2. 用 GitHub 账号注册/登录
3. 点击 **"New Project"**
4. 选择 **Region**: `US East (N. Virginia)` 或 `Europe (Frankfurt)`
5. 创建后，复制 **Connection String**（格式：postgresql://...）
6. 保存下来，后面用

---

## 第二步：Railway 后端部署（10分钟）

1. 访问 https://railway.app
2. 用 GitHub 账号注册/登录
3. 点击 **"New Project"** → **"Deploy from GitHub repo"**
4. 选择你的 TokenSaver 仓库（如果还没推，先推上去）
5. 部署前设置环境变量（在 Railway Dashboard → Variables）：

```
DATABASE_URL=postgresql://...（Neon的连接字符串）
SECRET_KEY=openssl rand -hex 32（随机生成32位密钥）
ENVIRONMENT=production
```

6. 部署后会得到一个 URL，比如 `https://tokensaver-api.up.railway.app`
7. 记住这个 URL，后面用 `api.tokesave.com` CNAME 指向它

---

## 第三步：Vercel 前端部署（10分钟）

1. 访问 https://vercel.com
2. 用 GitHub 账号注册/登录
3. 点击 **"Add New Project"** → 导入 TokenSaver 前端仓库
4. 选择 `frontend` 目录作为根目录
5. 环境变量（选填，如果用 Vercel 自动部署）：
   ```
   NEXT_PUBLIC_API_URL=https://api.tokesave.com/api/v1
   ```
6. 部署完成会得到 `https://tokensaver-xxx.vercel.app`
7. 后续用域名绑定

---

## 第四步：Cloudflare DNS（5分钟）

1. 访问 https://cloudflare.com，注册账号
2. 添加域名：`tokesave.com`
3. 按提示修改域名 NS 记录到 Cloudflare
4. 添加 DNS 记录：

| Type | Name | Content | Proxy Status |
|------|------|---------|-------------|
| A | @ | Vercel IP（Vercel Dashboard 里找）| Proxied |
| CNAME | api | Railway URL（railway.app 那个）| Proxied |
| CNAME | www | @ | Proxied |

5. 开启 **Always Use HTTPS** 和 **Auto Minify**

---

## 第五步：GitHub 推代码（5分钟）

在本地执行：

```bash
cd /Users/apple/.openclaw/workspace/token-saver
git init
git add .
git commit -m "feat: TokenSaver v1.0 ready for deployment"

# 在GitHub创建新仓库，然后
# git remote add origin https://github.com/鹏哥用户名/tokensaver.git
git push -u origin main
```

---

## 第六步：配置支付（LemonSqueezy）

1. 访问 https://lemonsqueezy.com
2. 用邮箱注册（支持国内邮箱）
3. 创建 Store，添加产品：
   - Pro: $19/月, $190/年
   - Team: $99/月, $990/年
   - Enterprise: $499/月, $4990/年
4. 复制 API Key 和 Webhook Secret
5. 在 Railway 环境变量添加：
   ```
   LEMONSQUEEZY_API_KEY=...
   LEMONSQUEEZY_WEBHOOK_SECRET=...
   LEMONSQUEEZY_STORE_ID=...
   ```

---

## 部署完成后的URL

- **前端**: https://tokesave.com
- **后端 API**: https://api.tokesave.com/api/v1
- **API 文档**: https://api.tokesave.com/docs
- **Webhook**: https://api.tokesave.com/api/v1/billing/webhook

---

## 需要鹏哥现在做的事（按顺序）

1. [ ] 注册 Neon 账号 → 创建数据库 → 复制连接字符串
2. [ ] 注册 Railway 账号 → 推代码到 GitHub → 部署后端
3. [ ] 注册 Vercel 账号 → 部署前端
4. [ ] 注册 Cloudflare 账号 → 配置 DNS
5. [ ] 注册 LemonSqueezy 账号 → 创建产品 → 给濠仔 API Key

做完第1步就给濠仔说，濠仔可以实时配置后端环境变量。

---

## 技术栈总览

| 组件 | 服务 | 费用 | 用途 |
|------|------|------|------|
| 前端 | Vercel | $0 | Next.js 托管 + CDN |
| 后端 | Railway | $5/月 | FastAPI Docker 容器 |
| 数据库 | Neon | $0 | PostgreSQL 无服务器 |
| DNS | Cloudflare | $8/年 | 域名 + CDN + SSL |
| 支付 | LemonSqueezy | 5%+50¢ | 订阅收费 |

**总费用**: 约 $13/月（首月可能免费）

---

*部署指南由濠仔编写*
*2026-06-07*
