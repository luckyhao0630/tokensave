#!/bin/bash
# MediaKit 24小时持续监控脚本

LOG_DIR="/Users/apple/.openclaw/workspace/token-saver/logs"
mkdir -p $LOG_DIR

while true; do
    # 每30分钟检查一次
    python3 /Users/apple/.openclaw/workspace/token-saver/scripts/automation.py >> $LOG_DIR/monitor.log 2>&1
    
    # 检查后端API
    curl -s https://api.tokesave.com/health > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "[$(date)] ⚠️ 后端API离线" >> $LOG_DIR/alert.log
    fi
    
    # 等待30分钟
    sleep 1800
done
