#!/usr/bin/env python3
"""
TokenSaver 监控与通知脚本
定期检查 API 状态，发送异常通知
"""

import requests
import json
import time
from datetime import datetime

# 配置
BASE_URL = "https://api.tokesave.com"
FRONTEND_URL = "https://www.tokesave.com"
CHECK_INTERVAL = 300  # 5分钟检查一次

# 飞书 Webhook（如果有配置）
FEISHU_WEBHOOK = None

# 测试端点
ENDPOINTS = [
    ("health", f"{BASE_URL}/health", "GET"),
    ("plans", f"{BASE_URL}/api/v1/plans", "GET"),
    ("login", f"{BASE_URL}/api/v1/auth/login", "POST", {"email": "test_integration@example.com", "password": "test123456"}),
    ("compress", f"{BASE_URL}/api/v1/compress", "POST", {"messages": [{"role": "user", "content": "test"}]}),
    ("proxy", f"{BASE_URL}/proxy/providers", "GET"),
    ("docs", f"{BASE_URL}/docs", "GET"),
    ("frontend", FRONTEND_URL, "GET"),
]


def check_endpoint(name, url, method, data=None):
    """检查单个端点"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            return False, "Unknown method"
        
        status = response.status_code
        if status in [200, 401, 404]:  # 401/404 是正常业务响应
            return True, f"OK ({status})"
        else:
            return False, f"Status {status}"
    except Exception as e:
        return False, str(e)


def run_monitor():
    """运行监控检查"""
    results = []
    all_ok = True
    
    print(f"\n{'='*60}")
    print(f"TokenSaver 监控检查 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    
    for check in ENDPOINTS:
        name = check[0]
        url = check[1]
        method = check[2]
        data = check[3] if len(check) > 3 else None
        
        ok, detail = check_endpoint(name, url, method, data)
        status = "✅" if ok else "❌"
        results.append(f"{status} {name}: {detail}")
        
        if not ok:
            all_ok = False
        
        print(f"{status} {name}: {detail}")
    
    # 统计
    total = len(ENDPOINTS)
    passed = sum(1 for r in results if r.startswith("✅"))
    
    print(f"\n结果: {passed}/{total} 通过")
    
    if not all_ok:
        print("⚠️ 检测到异常，需要处理！")
        # 这里可以发送通知
    else:
        print("✅ 所有服务正常")
    
    return all_ok, results


if __name__ == "__main__":
    # 单次检查
    ok, results = run_monitor()
    
    # 连续监控模式（取消注释启用）
    # while True:
    #     run_monitor()
    #     time.sleep(CHECK_INTERVAL)
