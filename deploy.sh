#!/bin/bash
# TokenSaver 部署脚本
# 用法: ./deploy.sh [environment]
# environment: development | staging | production

set -e

ENV=${1:-production}
echo "🚀 TokenSaver 部署 - 环境: $ENV"

# 检查环境变量
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在，请复制 .env.example 并配置"
    exit 1
fi

# 生成JWT密钥（如果未设置）
if ! grep -q "SECRET_KEY=" .env || grep -q "SECRET_KEY=your-secret-key" .env; then
    echo "🔑 生成 JWT 密钥..."
    NEW_KEY=$(openssl rand -hex 32)
    if grep -q "SECRET_KEY=" .env; then
        sed -i '' "s|SECRET_KEY=.*|SECRET_KEY=$NEW_KEY|" .env
    else
        echo "SECRET_KEY=$NEW_KEY" >> .env
    fi
    echo "✅ JWT 密钥已生成"
fi

# 构建镜像
echo "📦 构建 Docker 镜像..."
docker-compose build

# 启动服务
echo "🟢 启动服务..."
docker-compose up -d

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
sleep 5

# 初始化数据库
echo "🗄️ 初始化数据库..."
docker-compose exec backend python -c "from app.models.database import init_db; init_db()"

# 健康检查
echo "🏥 健康检查..."
HEALTH_STATUS=$(curl -s http://localhost:8000/health || echo "failed")
if echo "$HEALTH_STATUS" | grep -q "ok"; then
    echo "✅ 后端服务健康"
else
    echo "⚠️ 后端服务可能未就绪，请检查日志"
fi

# 显示状态
echo ""
echo "🎉 部署完成!"
echo ""
echo "服务地址:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo ""
echo "查看日志:"
echo "  后端: docker-compose logs -f backend"
echo "  前端: docker-compose logs -f frontend"
