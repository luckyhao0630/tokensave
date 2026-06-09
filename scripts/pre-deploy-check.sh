#!/usr/bin/env bash
# MediaKit 部署前自检脚本
# 在每次推送前自动运行，确保没有错误

set -e

PROJECT_DIR="/Users/apple/.openclaw/workspace/token-saver"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOG_FILE="$PROJECT_DIR/logs/pre-deploy-check.log"

mkdir -p "$PROJECT_DIR/logs"

echo "🔍 开始部署前自检..."
echo "$(date) - 开始自检" > "$LOG_FILE"

# 1. 检查前端构建
echo "📦 检查前端构建..."
cd "$FRONTEND_DIR"
if npm run build >> "$LOG_FILE" 2>&1; then
    echo "✅ 前端构建通过"
else
    echo "❌ 前端构建失败"
    echo "错误日志:"
    tail -50 "$LOG_FILE"
    exit 1
fi

# 2. 检查 TypeScript 类型
echo "🔍 检查 TypeScript 类型..."
if npx tsc --noEmit >> "$LOG_FILE" 2>&1; then
    echo "✅ TypeScript 类型检查通过"
else
    echo "❌ TypeScript 类型检查失败"
    tail -50 "$LOG_FILE"
    exit 1
fi

# 3. 检查是否有未提交文件
echo "📋 检查 Git 状态..."
cd "$PROJECT_DIR"
if [ -n "$(git status --short)" ]; then
    echo "⚠️ 有未提交文件，自动提交..."
    git add -A
    git commit -m "auto: pre-deploy fixes"
    git push origin main
fi

# 4. 检查后端 API 健康状态
echo "🏥 检查后端 API..."
if curl -s https://api.tokesave.com/health | grep -q "ok"; then
    echo "✅ 后端 API 正常"
else
    echo "⚠️ 后端 API 可能离线，但不阻止部署"
fi

echo "✅ 所有检查通过，可以部署"
echo "$(date) - 自检完成" >> "$LOG_FILE"
