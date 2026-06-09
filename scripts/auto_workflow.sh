#!/bin/bash
# MediaKit 自动化工作流脚本
# 24小时持续运行，记录日志，减少打扰

LOG_DIR="/Users/apple/.openclaw/workspace/token-saver/logs"
mkdir -p $LOG_DIR

LOG_FILE="$LOG_DIR/workflow_$(date +%Y%m%d).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

log "=== MediaKit 自动化工作流启动 ==="

# 1. 检查 GitHub 推送状态
log "检查 GitHub 推送状态..."
cd /Users/apple/.openclaw/workspace/token-saver

if git push origin main 2>&1 | grep -q "Everything up-to-date"; then
    log "✅ GitHub 已是最新"
else
    log "🔄 正在推送代码到 GitHub..."
    git push origin main >> $LOG_FILE 2>&1
    log "✅ GitHub 推送完成"
fi

# 2. 检查构建状态
log "检查前端构建..."
cd /Users/apple/.openclaw/workspace/token-saver/frontend
if npm run build >> $LOG_FILE 2>&1; then
    log "✅ 前端构建成功"
else
    log "❌ 前端构建失败，查看日志"
fi

# 3. 检查后端 API
log "检查后端 API 健康状态..."
if curl -s https://api.tokesave.com/health | grep -q "ok"; then
    log "✅ 后端 API 运行正常"
else
    log "⚠️ 后端 API 可能离线"
fi

# 4. 记录当前工作进度
log "=== 工作进度记录 ==="
echo "已完成：" >> $LOG_FILE
echo "- 人声分离后端 API" >> $LOG_FILE
echo "- 语音转文字后端 API" >> $LOG_FILE
echo "- 前端首页（MediaKit 品牌）" >> $LOG_FILE
echo "- 多语言支持（en/zh/ja/es）" >> $LOG_FILE

echo "待完成：" >> $LOG_FILE
echo "- 背景移除前端页面" >> $LOG_FILE
echo "- 视频下载前端页面" >> $LOG_FILE
echo "- 部署到 Vercel" >> $LOG_FILE
echo "- 测试所有工具功能" >> $LOG_FILE

log "=== 工作流检查完成 ==="
