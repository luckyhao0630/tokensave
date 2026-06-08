#!/usr/bin/env python3
"""
TokenSaver 自动化测试脚本
全面测试所有 API 端点和核心功能
"""

import requests
import json
import sys
import time
from datetime import datetime

# 配置
BASE_URL = "https://api.tokesave.com"
FRONTEND_URL = "https://www.tokesave.com"

# 测试账号
TEST_EMAIL = "test_integration@example.com"
TEST_PASSWORD = "test123456"
ADMIN_EMAIL = "luckyhao0630@gmail.com"
ADMIN_PASSWORD = "admin123456"

# 颜色输出
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def log(status, message):
    """打印测试结果"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    if status == "pass":
        print(f"{Colors.GREEN}[✅ {timestamp}] {message}{Colors.RESET}")
    elif status == "fail":
        print(f"{Colors.RED}[❌ {timestamp}] {message}{Colors.RESET}")
    elif status == "warn":
        print(f"{Colors.YELLOW}[⚠️ {timestamp}] {message}{Colors.RESET}")
    else:
        print(f"{Colors.BLUE}[ℹ️ {timestamp}] {message}{Colors.RESET}")

def test_endpoint(name, method, path, expected_status=200, **kwargs):
    """测试单个 API 端点"""
    url = f"{BASE_URL}{path}"
    try:
        response = requests.request(method, url, timeout=10, **kwargs)
        if response.status_code == expected_status:
            try:
                data = response.json()
                log("pass", f"{name}: {response.status_code} ✅")
                return True, data
            except:
                log("pass", f"{name}: {response.status_code} (non-JSON) ✅")
                return True, None
        else:
            log("fail", f"{name}: {response.status_code} (expected {expected_status}) ❌")
            try:
                log("info", f"  Response: {response.text[:200]}")
            except:
                pass
            return False, None
    except Exception as e:
        log("fail", f"{name}: {str(e)} ❌")
        return False, None

def run_all_tests():
    """运行所有测试"""
    print(f"\n{'='*60}")
    print(f"TokenSaver 自动化测试")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    passed = 0
    failed = 0
    token = None
    api_key = None
    
    # 1. 健康检查
    print("\n📋 1. 基础检查")
    print("-" * 40)
    ok, _ = test_endpoint("健康检查", "GET", "/health")
    if ok: passed += 1
    else: failed += 1
    
    ok, _ = test_endpoint("根路由", "GET", "/api/v1")
    if ok: passed += 1
    else: failed += 1
    
    # 2. 公开 API
    print("\n📋 2. 公开 API")
    print("-" * 40)
    ok, plans = test_endpoint("套餐查询", "GET", "/api/v1/plans")
    if ok: 
        passed += 1
        if plans and 'plans' in plans:
            log("info", f"  找到 {len(plans.get('plans', {}))} 个套餐")
    else: failed += 1
    
    ok, providers = test_endpoint("Provider列表", "GET", "/proxy/providers")
    if ok:
        passed += 1
        if providers and 'providers' in providers:
            log("info", f"  支持 {len(providers['providers'])} 个Provider")
    else: failed += 1
    
    ok, _ = test_endpoint("API文档", "GET", "/docs")
    if ok: passed += 1
    else: failed += 1
    
    # 3. 用户注册
    print("\n📋 3. 用户注册")
    print("-" * 40)
    ok, user = test_endpoint(
        "注册", "POST", "/api/v1/auth/register",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": "Test User"}
    )
    if ok:
        passed += 1
        if user and 'id' in user:
            log("info", f"  用户ID: {user['id']}")
    else:
        failed += 1
        # 可能已存在，尝试登录
        log("warn", "注册失败，尝试登录现有账号")
    
    # 4. 用户登录
    print("\n📋 4. 用户登录")
    print("-" * 40)
    
    # JSON 登录
    ok, login_data = test_endpoint(
        "JSON登录", "POST", "/api/v1/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if ok and login_data and 'access_token' in login_data:
        passed += 1
        token = login_data['access_token']
        log("info", f"  Token: {token[:20]}...")
    else:
        failed += 1
    
    # OAuth2 表单登录
    ok, _ = test_endpoint(
        "OAuth2登录", "POST", "/api/v1/auth/login",
        data={"username": TEST_EMAIL, "password": TEST_PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if ok: passed += 1
    else: failed += 1
    
    if not token:
        log("fail", "无法获取token，跳过后续认证测试")
        return passed, failed
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 5. 用户信息
    print("\n📋 5. 用户信息")
    print("-" * 40)
    ok, me = test_endpoint("获取用户信息", "GET", "/api/v1/auth/me", headers=headers)
    if ok:
        passed += 1
        if me:
            log("info", f"  邮箱: {me.get('email')}, 套餐: {me.get('plan')}")
    else: failed += 1
    
    ok, _ = test_endpoint(
        "更新用户信息", "PUT", "/api/v1/auth/me",
        headers=headers, json={"name": "Updated Name"}
    )
    if ok: passed += 1
    else: failed += 1
    
    # 6. 压缩 API
    print("\n📋 6. 压缩 API")
    print("-" * 40)
    
    # 先创建 API Key
    ok, key_data = test_endpoint(
        "创建API Key", "POST", "/api/v1/api-keys",
        headers=headers, json={"name": "test-key"}
    )
    if ok and key_data and 'api_key' in key_data:
        passed += 1
        api_key = key_data['api_key']
        log("info", f"  API Key: {api_key[:20]}...")
    else:
        failed += 1
    
    # 用 API Key 压缩
    if api_key:
        ok, compress = test_endpoint(
            "压缩(JSON)", "POST", "/api/v1/compress",
            headers={"X-API-Key": api_key, "Content-Type": "application/json"},
            json={
                "messages": [
                    {"role": "user", "content": json.dumps({"users": [{"id": i, "name": f"User{i}"} for i in range(50)]})}
                ],
                "model": "gpt-4o"
            }
        )
        if ok:
            passed += 1
            if compress:
                saved = compress.get('tokens_saved', 0)
                ratio = compress.get('savings_percentage', 0)
                log("info", f"  节省: {saved} tokens ({ratio:.1f}%)")
        else: failed += 1
        
        # 压缩文本
        ok, _ = test_endpoint(
            "压缩(文本)", "POST", "/api/v1/compress",
            headers={"X-API-Key": api_key, "Content-Type": "application/json"},
            json={
                "messages": [
                    {"role": "user", "content": "This is a test message for compression. " * 100}
                ],
                "model": "gpt-4o"
            }
        )
        if ok: passed += 1
        else: failed += 1
    
    # 7. API Key 管理
    print("\n📋 7. API Key 管理")
    print("-" * 40)
    ok, keys = test_endpoint("API Key列表", "GET", "/api/v1/api-keys", headers=headers)
    if ok:
        passed += 1
        if keys and isinstance(keys, list):
            log("info", f"  共有 {len(keys)} 个API Key")
            if keys:
                key_id = keys[0].get('id')
                if key_id:
                    ok, _ = test_endpoint(
                        f"删除API Key", "DELETE", f"/api/v1/api-keys/{key_id}",
                        headers=headers
                    )
                    if ok: passed += 1
                    else: failed += 1
    else: failed += 1
    
    # 8. 用量统计
    print("\n📋 8. 用量统计")
    print("-" * 40)
    ok, stats = test_endpoint("用量统计", "GET", "/api/v1/usage/stats", headers=headers)
    if ok:
        passed += 1
        if stats:
            log("info", f"  总请求: {stats.get('total_requests', 0)}")
    else: failed += 1
    
    ok, _ = test_endpoint("每日统计", "GET", "/api/v1/usage/daily?days=7", headers=headers)
    if ok: passed += 1
    else: failed += 1
    
    # 9. 计费
    print("\n📋 9. 计费")
    print("-" * 40)
    ok, _ = test_endpoint("当前套餐", "GET", "/api/v1/billing/current", headers=headers)
    if ok: passed += 1
    else: failed += 1
    
    # 10. 前端页面
    print("\n📋 10. 前端页面")
    print("-" * 40)
    pages = ["/", "/login", "/register", "/dashboard", "/pricing", "/docs", "/profile", "/admin/login"]
    for page in pages:
        try:
            resp = requests.get(f"{FRONTEND_URL}{page}", timeout=10, allow_redirects=True)
            if resp.status_code == 200:
                log("pass", f"{page}: {resp.status_code} ✅")
                passed += 1
            else:
                log("fail", f"{page}: {resp.status_code} ❌")
                failed += 1
        except Exception as e:
            log("fail", f"{page}: {str(e)} ❌")
            failed += 1
    
    # 11. 管理员测试
    print("\n📋 11. 管理员测试")
    print("-" * 40)
    ok, admin_login = test_endpoint(
        "管理员登录", "POST", "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if ok and admin_login and 'access_token' in admin_login:
        passed += 1
        admin_token = admin_login['access_token']
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        ok, _ = test_endpoint("管理后台统计", "GET", "/api/v1/admin/dashboard", headers=admin_headers)
        if ok: passed += 1
        else: failed += 1
        
        ok, users = test_endpoint("用户列表", "GET", "/api/v1/admin/users", headers=admin_headers)
        if ok:
            passed += 1
            if users and isinstance(users, list):
                log("info", f"  共 {len(users)} 个用户")
        else: failed += 1
    else:
        failed += 1
    
    # 12. Proxy 测试 (需要 Provider API Key)
    print("\n📋 12. Proxy 模式")
    print("-" * 40)
    log("warn", "Proxy模式需要配置Provider API Key，跳过实际测试")
    log("info", "  支持的Provider: OpenAI, Anthropic, DeepSeek, OpenRouter")
    
    # 总结
    print(f"\n{'='*60}")
    print(f"测试结果总结")
    print(f"{'='*60}")
    print(f"通过: {Colors.GREEN}{passed}{Colors.RESET}")
    print(f"失败: {Colors.RED}{failed}{Colors.RESET}")
    print(f"总计: {passed + failed}")
    print(f"成功率: {(passed/(passed+failed)*100):.1f}%")
    print(f"{'='*60}\n")
    
    return passed, failed

if __name__ == "__main__":
    p, f = run_all_tests()
    sys.exit(0 if f == 0 else 1)
