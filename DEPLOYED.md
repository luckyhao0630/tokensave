# TokenSaver 部署完成

## 后端API
- **URL**: https://tokensave-production.up.railway.app
- **Health**: https://tokensave-production.up.railway.app/health ✅
- **API Docs**: https://tokensave-production.up.railway.app/docs

## 测试命令

### 1. 健康检查
```bash
curl https://tokensave-production.up.railway.app/health
```

### 2. 注册
```bash
curl -X POST https://tokensave-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

### 3. 登录
```bash
curl -X POST https://tokensave-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your@email.com&password=yourpassword"
```

### 4. 压缩API
```bash
curl -X POST https://tokensave-production.up.railway.app/api/v1/compress \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"messages":[{"role":"user","content":"test"}],"model":"gpt-4o"}'
```

## 下一步
1. 配置前端指向这个API
2. 测试完整功能
3. 配置Vercel部署前端
