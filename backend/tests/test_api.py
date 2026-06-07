"""
TokenSaver API 完整测试脚本
直接测试后端所有功能，无需启动服务器
"""

import sys
sys.path.insert(0, '/Users/apple/.openclaw/workspace/token-saver/backend')

from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

print("=" * 60)
print("🧪 TokenSaver API 测试开始")
print("=" * 60)

# 1. 健康检查
print("\n1. 健康检查 /health")
r = client.get("/health")
print(f"   Status: {r.status_code}")
print(f"   Response: {r.json()}")

# 2. 根路径
print("\n2. 根路径 /")
r = client.get("/")
print(f"   Status: {r.status_code}")
print(f"   Response: {r.json()}")

# 3. 注册
print("\n3. 用户注册 /api/v1/auth/register")
register_data = {
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
}
r = client.post("/api/v1/auth/register", json=register_data)
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    user = r.json()
    print(f"   User ID: {user['id']}, Email: {user['email']}")
else:
    print(f"   Error: {r.text}")

# 4. 登录
print("\n4. 用户登录 /api/v1/auth/login")
login_data = {"username": "test@example.com", "password": "testpassword123"}
r = client.post("/api/v1/auth/login", data=login_data)
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    token = r.json()["access_token"]
    print(f"   Token: {token[:20]}...")
else:
    print(f"   Error: {r.text}")
    token = None

if token:
    headers = {"Authorization": f"Bearer {token}"}
    
    # 5. 获取用户信息
    print("\n5. 用户信息 /api/v1/auth/me")
    r = client.get("/api/v1/auth/me", headers=headers)
    print(f"   Status: {r.status_code}")
    print(f"   Response: {r.json()}")
    
    # 6. 创建API Key
    print("\n6. 创建API Key /api/v1/api-keys")
    r = client.post("/api/v1/api-keys?name=Test+Key", headers=headers)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        api_key = r.json()["api_key"]
        print(f"   API Key: {api_key[:20]}...")
    else:
        api_key = None
    
    if api_key:
        api_headers = {"X-API-Key": api_key}
        
        # 7. 压缩API - JSON数据
        print("\n7. 压缩API - JSON数据 /api/v1/compress")
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": json.dumps({
                "users": [{"id": i, "name": f"User{i}", "email": f"user{i}@example.com"} for i in range(50)],
                "metadata": {"total": 50, "page": 1}
            })}
        ]
        r = client.post("/api/v1/compress", json={"messages": test_messages, "model": "gpt-4o"}, headers=api_headers)
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            result = r.json()
            print(f"   Before: {result['tokens_before']} tokens")
            print(f"   After: {result['tokens_after']} tokens")
            print(f"   Saved: {result['savings_percentage']:.1f}%")
            print(f"   Cost Saved: ${result['cost_saved_usd']}")
            print(f"   Transforms: {result['transforms_applied']}")
        else:
            print(f"   Error: {r.text}")
        
        # 8. 压缩API - 日志
        print("\n8. 压缩API - 日志 /api/v1/compress")
        log_messages = [
            {"role": "user", "content": "Check these logs:\n" + "\n".join([f"2024-01-{i:02d} 10:00:00 INFO Server started" for i in range(1, 31)])}
        ]
        r = client.post("/api/v1/compress", json={"messages": log_messages, "model": "gpt-4o"}, headers=api_headers)
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            result = r.json()
            print(f"   Before: {result['tokens_before']} tokens")
            print(f"   After: {result['tokens_after']} tokens")
            print(f"   Saved: {result['savings_percentage']:.1f}%")
        
        # 9. 用量统计
        print("\n9. 用量统计 /api/v1/usage/stats")
        r = client.get("/api/v1/usage/stats", headers=headers)
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            stats = r.json()
            print(f"   Total Requests: {stats['total_requests']}")
            print(f"   Total Tokens Saved: {stats['total_tokens_saved']}")
            print(f"   Total Cost Saved: ${stats['total_cost_saved']}")
            print(f"   Quota Plan: {stats['quota']['plan']}")
        
        # 10. 套餐信息
        print("\n10. 套餐信息 /api/v1/plans")
        r = client.get("/api/v1/plans", headers=headers)
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            plans = r.json()["plans"]
            print(f"   Plans: {list(plans.keys())}")
    
    # 11. 限流测试 - 免费版限制
    print("\n11. 限流测试 - 大量请求")
    # 创建新用户测试限流
    client.post("/api/v1/auth/register", json={
        "email": "limit_test@example.com",
        "password": "test123456",
        "name": "Limit Test"
    })
    login_r = client.post("/api/v1/auth/login", data={"username": "limit_test@example.com", "password": "test123456"})
    if login_r.status_code == 200:
        limit_token = login_r.json()["access_token"]
        limit_headers = {"Authorization": f"Bearer {limit_token}"}
        # 创建API Key
        key_r = client.post("/api/v1/api-keys", headers=limit_headers)
        if key_r.status_code == 200:
            limit_api_key = key_r.json()["api_key"]
            limit_api_headers = {"X-API-Key": limit_api_key}
            # 发送101次请求（超过100限制）
            for i in range(101):
                r = client.post("/api/v1/compress", 
                    json={"messages": [{"role": "user", "content": "test"}], "model": "gpt-4o"},
                    headers=limit_api_headers
                )
            print(f"   Status after 101 requests: {r.status_code}")
            if r.status_code == 429:
                print(f"   ✅ 限流正常工作！")
            else:
                print(f"   Response: {r.text[:100]}")

# 12. 支持的Provider
print("\n12. Proxy支持的Provider /proxy/providers")
r = client.get("/proxy/providers")
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    providers = r.json()["providers"]
    for p in providers:
        print(f"   - {p['id']}: {p['name']} ({p['base_url']})")

print("\n" + "=" * 60)
print("✅ 测试完成")
print("=" * 60)
