#!/bin/bash
# 一键启动 MediaKit 24小时工作流

echo "🚀 启动 MediaKit 全自动工作流..."

# 1. 立即运行一次
python3 /Users/apple/.openclaw/workspace/token-saver/scripts/automation.py

# 2. 启动后台监控
nohup bash /Users/apple/.openclaw/workspace/token-saver/scripts/monitor.sh > /Users/apple/.openclaw/workspace/token-saver/logs/nohup.out 2>&1 &
echo $! > /Users/apple/.openclaw/workspace/token-saver/scripts/monitor.pid

echo "✅ 工作流已启动！"
echo "📊 日志位置: /Users/apple/.openclaw/workspace/token-saver/logs/"
echo "🔄 每30分钟自动检查一次"
