"""
TokenSaver 系统测试套件
一键运行所有测试
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://tokensave-production.up.railway.app/api/v1"
FRONTEND_URL = "https://tokesave.com"

class Colors:
    PASS = "\033[92m"
    FAIL = "\033[91m"
    WARN = "\033[93m"
    INFO = "\033[94m"
    END = "\033[0m"

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.total = 0
        self.errors = []
    
    def check(self, name, condition, details=""):
        self.total += 1
        if condition:
            self.passed += 1
            print(f"{Colors.PASS}✅ {name}{Colors.END}")
        else:
            self.failed += 1
            self.errors.append(f"{name}: {details}")
            print(f"{Colors.FAIL}❌ {name}{Colors.END}")
            if details:
                print(f"   {Colors.WARN}详情: {details}{Colors.END}")

def run_all_tests():
    result = TestResult()
    
    print(f"{Colors.INFO}\n{'='*60}{Colors.END}")
    print(f"{Colors.INFO}  TokenSaver 系统全量测试{Colors.END}")
    print(f"{Colors.INFO}  时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}
    print(f"{Colors.INFO}{'='*60}{Colors.END}\n")
    
    # 1. 前端页面测试
    print(f"{Colors.INFO}【1/8】前端页面测试{Colors.END}")
    pages = [
        ("首页", "/"),
        ("登录页", "/login"),
        ("Dashboard", "/dashboard"),
        ("文档页", "/docs"),
        ("定价页", "/pricing"),
        ("后台登录", "/admin/login"),
    ]
    for name, path in pages:
        try:
            resp = requests.get(f"{FRONTEND_URL}{path}", timeout=10)
            result.check(f"{name} 可访问", resp.status_code == 200, f"状态码: {resp.status_code}")
        except Exception as e:
            result.check(f"{name} 可访问", False, str(e))
    
    # 2. 后端健康检查
    print(f"\n{Colors.INFO}【2/8】后端健康检查{Colors.END}")
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=10)
        data = resp.json()
        result.check("Health API", resp.status_code == 200 and data.get("status") == "ok", str(data))
    except Exception as e:
        result.check("Health API", False, str(e))
    
    # 3. 注册/登录测试
    print(f"\n{Colors.INFO}【3/8】用户注册/登录测试{Colors.END}")
    test_email = f"test_{int(time.time())}@example.com"
    test_pass = "TestPass123456"
    token = None
    
    try:
        # 注册
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": test_email,
            "password": test_pass
        }, timeout=10)
        result.check("用户注册", resp.status_code == 200, f"状态码: {resp.status_code}")
        
        # 登录
        resp = requests.post(f"{BASE_URL}/auth/login", data={
            "username": test_email,
            "password": test_pass
        }, timeout=10)
        data = resp.json()
        token = data.get("access_token")
        result.check("用户登录", resp.status_code == 200 and token, f"状态码: {resp.status_code}")
        
        # 获取用户信息
        if token:
            resp = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=10)
            data = resp.json()
            result.check("获取用户信息", resp.status_code == 200 and data.get("email") == test_email, str(data))
    except Exception as e:
        result.check("用户系统", False, str(e))
    
    # 4. API Key 测试
    print(f"\n{Colors.INFO}【4/8】API Key 管理测试{Colors.END}")
    api_key = None
    if token:
        try:
            resp = requests.post(f"{BASE_URL}/api-keys", headers={"Authorization": f"Bearer {token}"}, timeout=10)
            data = resp.json()
            api_key = data.get("api_key")
            result.check("创建 API Key", resp.status_code == 200 and api_key, str(data))
            
            if api_key:
                # 列出 API Keys
                resp = requests.get(f"{BASE_URL}/api-keys", headers={"Authorization": f"Bearer {token}"}, timeout=10)
                result.check("列出 API Keys", resp.status_code == 200, f"状态码: {resp.status_code}")
        except Exception as e:
            result.check("API Key 管理", False, str(e))
    
    # 5. 压缩 API 测试
    print(f"\n{Colors.INFO}【5/8】压缩 API 测试{Colors.END}")
    if api_key:
        try:
            resp = requests.post(f"{BASE_URL}/compress", headers={
                "Content-Type": "application/json",
                "X-API-Key": api_key
            }, json={
                "messages": [{"role": "user", "content": "test data"}],
                "model": "gpt-4o"
            }, timeout=30)
            data = resp.json()
            result.check("压缩 API", resp.status_code == 200 and "savings_percentage" in data, 
                        f"状态码: {resp.status_code}, 响应: {str(data)[:100]}")
            
            if resp.status_code == 200:
                savings = data.get("savings_percentage", 0)
                result.check("压缩率 > 0", savings > 0, f"压缩率: {savings}%")
        except Exception as e:
            result.check("压缩 API", False, str(e))
    else:
        result.check("压缩 API", False, "API Key 未创建")
    
    # 6. 用量统计测试
    print(f"\n{Colors.INFO}【6/8】用量统计测试{Colors.END}")
    if token:
        try:
            # Bearer Token 方式
            resp = requests.get(f"{BASE_URL}/usage/stats", headers={"Authorization": f"Bearer {token}"}, timeout=10)
            data = resp.json()
            result.check("用量统计 (Bearer)", resp.status_code == 200 and "total_requests" in data, str(data)[:100])
            
            # API Key 方式
            if api_key:
                resp = requests.get(f"{BASE_URL}/usage/stats", headers={"X-API-Key": api_key}, timeout=10)
                result.check("用量统计 (API Key)", resp.status_code == 200, f"状态码: {resp.status_code}")
        except Exception as e:
            result.check("用量统计", False, str(e))
    
    # 7. 套餐/Proxy 测试
    print(f"\n{Colors.INFO}【7/8】套餐/Proxy 测试{Colors.END}")
    try:
        resp = requests.get(f"{BASE_URL}/plans", headers={"Authorization": f"Bearer {token}"} if token else {}, timeout=10)
        data = resp.json()
        result.check("套餐列表", resp.status_code == 200 and "plans" in data, str(data)[:100])
        
        resp = requests.get(f"{BASE_URL}/../proxy/providers", timeout=10)
        data = resp.json()
        result.check("Proxy Providers", resp.status_code == 200 and "providers" in data, str(data)[:100])
    except Exception as e:
        result.check("套餐/Proxy", False, str(e))
    
    # 8. 管理后台权限测试
    print(f"\n{Colors.INFO}【8/8】管理后台权限测试{Colors.END}")
    if token:
        try:
            resp = requests.get(f"{BASE_URL}/admin/dashboard", headers={"Authorization": f"Bearer {token}"}, timeout=10)
            result.check("普通用户无管理权限", resp.status_code == 403, f"状态码: {resp.status_code}")
        except Exception as e:
            result.check("管理后台权限", False, str(e))
    
    # 结果汇总
    print(f"\n{Colors.INFO}{'='*60}{Colors.END}")
    print(f"{Colors.INFO}  测试完成{Colors.END}")
    print(f"{Colors.INFO}{'='*60}{Colors.END}\n")
    
    print(f"  总计: {result.total}")
    print(f"{Colors.PASS}  通过: {result.passed}{Colors.END}")
    print(f"{Colors.FAIL}  失败: {result.failed}{Colors.END}")
    
    if result.errors:
        print(f"\n{Colors.WARN}失败详情:{Colors.END}")
        for error in result.errors:
            print(f"  {Colors.FAIL}• {error}{Colors.END}")
    
    if result.failed == 0:
        print(f"\n{Colors.PASS}🎉 所有测试通过！系统运行正常。{Colors.END}")
        return True
    else:
        print(f"\n{Colors.FAIL}⚠️  有 {result.failed} 项测试失败，需要修复。{Colors.END}")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
