#!/bin/bash
# TokenSaver 自动化全量测试脚本
# 运行: bash test_full.sh

set -e

BASE_URL="https://tokensave-production.up.railway.app/api/v1"
FRONTEND_URL="https://tokesave.com"

PASS=0
FAIL=0
TOTAL=0

function test() {
    local name="$1"
    local cmd="$2"
    local expect="$3"
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "[$TOTAL] $name... "
    
    result=$(eval "$cmd" 2>/dev/null || echo "FAIL")
    
    if echo "$result" | grep -q "$expect"; then
        echo "✅ PASS"
        PASS=$((PASS + 1))
    else
        echo "❌ FAIL"
        echo "   Expected: $expect"
        echo "   Got: $result"
        FAIL=$((FAIL + 1))
    fi
}

echo "═══════════════════════════════════════════════════════════════"
echo "          TokenSaver 生产环境全量自动化测试"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "测试环境:"
echo "  后端: $BASE_URL"
echo "  前端: $FRONTEND_URL"
echo ""

# 1. 前端测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【1/12】前端页面测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test "首页加载" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL" "200"
test "登录页加载" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/login" "200"
test "注册页加载" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/login" "200"
test "Dashboard页加载" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/dashboard" "200"
test "文档页加载" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL/docs" "200"

# 2. 后端健康检查
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【2/12】后端健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test "Health API" "curl -s $BASE_URL/health" "ok"
test "Root API" "curl -s $BASE_URL/" "TokenSaver API"

# 3. 注册流程
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【3/12】用户注册流程"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASS="TestPass123456"

test "用户注册" "curl -s -X POST $BASE_URL/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}'" "id"

# 4. 登录流程
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【4/12】用户登录流程"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_RESULT=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=$TEST_EMAIL&password=$TEST_PASS")
test "用户登录" "echo '$LOGIN_RESULT'" "access_token"

TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

# 5. 用户信息
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【5/12】用户信息获取"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test "获取用户信息" "curl -s -H 'Authorization: Bearer $TOKEN' $BASE_URL/auth/me" "$TEST_EMAIL"
test "用户信息包含plan" "curl -s -H 'Authorization: Bearer $TOKEN' $BASE_URL/auth/me" "plan"

# 6. API Key管理
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【6/12】API Key管理"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KEY_RESULT=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" $BASE_URL/api-keys)
test "创建API Key" "echo '$KEY_RESULT'" "api_key"

API_KEY=$(echo "$KEY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['api_key'])" 2>/dev/null || echo "")

test "列出API Keys" "curl -s -H 'Authorization: Bearer $TOKEN' $BASE_URL/api-keys" "id"

# 7. 压缩API测试
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【7/12】压缩API测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMPRESS_RESULT=$(curl -s -X POST -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" $BASE_URL/compress -d '{"messages":[{"role":"user","content":"test data"}],"model":"gpt-4o"}')
test "压缩API调用" "echo '$COMPRESS_RESULT'" "savings_percentage"

# 8. 用量统计（Bearer Token）
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【8/12】用量统计（Bearer Token）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATS_RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/usage/stats)
test "用量统计(Bearer)" "echo '$STATS_RESULT'" "total_requests"
test "用量统计包含quota" "echo '$STATS_RESULT'" "quota"

# 9. 用量统计（API Key）
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【9/12】用量统计（API Key）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATS_KEY=$(curl -s -H "X-API-Key: $API_KEY" $BASE_URL/usage/stats)
test "用量统计(API Key)" "echo '$STATS_KEY'" "total_requests"

# 10. 套餐信息
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【10/12】套餐信息"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PLANS=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/plans)
test "获取套餐列表" "echo '$PLANS'" "free"
test "套餐包含pro" "echo '$PLANS'" "pro"

# 11. Proxy Providers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【11/12】Proxy Providers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROXY=$(curl -s $BASE_URL/../proxy/providers)
test "Proxy Providers列表" "echo '$PROXY'" "openai"
test "Proxy Providers包含anthropic" "echo '$PROXY'" "anthropic"

# 12. 管理后台权限
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【12/12】管理后台权限控制"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ADMIN=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/admin/dashboard)
test "普通用户无法访问管理后台" "echo '$ADMIN'" "403"

# 13. 刷新Token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【13/12】Token刷新"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REFRESH=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['refresh_token'])" 2>/dev/null || echo "")
REFRESH_RESULT=$(curl -s -X POST $BASE_URL/auth/refresh -H "Content-Type: application/json" -d "{\"refresh_token\":\"$REFRESH\"}")
test "Token刷新" "echo '$REFRESH_RESULT'" "access_token"

# 结果汇总
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          测试完成"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 测试结果:"
echo "   ✅ 通过: $PASS"
echo "   ❌ 失败: $FAIL"
echo "   📋 总计: $TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 所有测试通过！系统运行正常。"
    exit 0
else
    echo "⚠️  有 $FAIL 项测试失败，请检查。"
    exit 1
fi
