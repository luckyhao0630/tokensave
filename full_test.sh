#!/bin/bash
# TokenSaver 全流程自检
# 2026-06-07

FRONT="https://tokesave.com"
API_BASE="https://tokensave-production.up.railway.app"
API="https://tokensave-production.up.railway.app/api/v1"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          TokenSaver 生产环境全流程自检                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS=0; FAIL=0; TOTAL=0

function check() {
    TOTAL=$((TOTAL+1))
    local name="$1"
    local cmd="$2"
    local expect="$3"
    result=$(eval "$cmd" 2>/dev/null)
    if echo "$result" | grep -q "$expect"; then
        echo "  ✅ $name"
        PASS=$((PASS+1))
    else
        echo "  ❌ $name"
        echo "     期望: $expect"
        echo "     实际: ${result:0:100}"
        FAIL=$((FAIL+1))
    fi
}

# ========== 1. 前端页面 ==========
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【1/7】前端页面加载"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "首页"              "curl -s -o /dev/null -w '%{http_code}' -L $FRONT"                  "200"
check "登录页"            "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/login"            "200"
check "Dashboard页"       "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/dashboard"       "200"
check "文档页"            "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/docs"             "200"
check "定价页"            "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/pricing"           "200"
check "后台登录页"        "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/admin/login"     "200"
check "个人中心页"        "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/profile"          "200"
check "管理后台页"        "curl -s -o /dev/null -w '%{http_code}' -L $FRONT/admin"            "200"

check "首页含新手教程"    "curl -s -L $FRONT | grep -o '5分钟快速上手'"                      "5分钟快速上手"
check "首页含新手必看"    "curl -s -L $FRONT | grep -o '新手必看'"                          "新手必看"
check "后台登录含🔐"       "curl -s -L $FRONT/admin/login | grep -o '🔐'"                     "🔐"
check "后台登录含后台登录" "curl -s -L $FRONT/admin/login | grep -o '后台登录'"               "后台登录"

# ========== 2. 后端API健康 ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【2/7】后端API健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Health API"        "curl -s $API_BASE/health | grep -o 'ok'"                             "ok"
check "API Root"          "curl -s $API/ | grep -o 'TokenSaver API'"                          "TokenSaver API"
check "API Docs"          "curl -s -o /dev/null -w '%{http_code}' $API/docs"                   "200"

# ========== 3. 用户注册/登录流程 ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【3/7】用户注册/登录全流程"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEST_EMAIL="autotest_$(date +%s%N)@example.com"
TEST_PASS="AutoTest123456"

check "注册新用户"        "curl -s -X POST $API/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"'$TEST_EMAIL'\",\"password\":\"'$TEST_PASS'\"}' | grep -o 'id'" "id"

LOGIN_RESULT=$(curl -s -X POST $API/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=$TEST_EMAIL&password=$TEST_PASS")
TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

check "登录成功"          "echo '$TOKEN' | grep -o 'eyJ'"                                     "eyJ"
check "登录返回Token"       "echo '$LOGIN_RESULT' | grep -o 'access_token'"                     "access_token"
check "登录返回Refresh"     "echo '$LOGIN_RESULT' | grep -o 'refresh_token'"                    "refresh_token"

# ========== 4. 用户信息/认证 ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【4/7】用户信息/认证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "获取用户信息"        "curl -s -H 'Authorization: Bearer $TOKEN' $API/auth/me | grep -o '$TEST_EMAIL'" "$TEST_EMAIL"
check "用户信息含plan"      "curl -s -H 'Authorization: Bearer $TOKEN' $API/auth/me | grep -o 'plan'" "plan"

# ========== 5. API Key管理 ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【5/7】API Key管理"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KEY_RESULT=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" $API/api-keys)
API_KEY=$(echo "$KEY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['api_key'])" 2>/dev/null || echo "")

check "创建API Key"         "echo '$KEY_RESULT' | grep -o 'api_key'"                            "api_key"
check "列出API Keys"        "curl -s -H 'Authorization: Bearer $TOKEN' $API/api-keys | grep -o 'id'" "id"
check "API Key格式正确"     "echo '$API_KEY' | grep -o '^ts_'"                                  "ts_"

# ========== 6. 压缩API + 用量统计 ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【6/7】压缩API + 用量统计"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMPRESS=$(curl -s -X POST -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" $API/compress -d '{"messages":[{"role":"user","content":"test data"}],"model":"gpt-4o"}')
check "压缩API调用"         "echo '$COMPRESS' | grep -o 'savings_percentage'"                   "savings_percentage"
check "压缩API返回tokens"   "echo '$COMPRESS' | grep -o 'tokens_before'"                          "tokens_before"
check "压缩API返回cost"     "echo '$COMPRESS' | grep -o 'cost_saved_usd'"                       "cost_saved_usd"

STATS=$(curl -s -H "Authorization: Bearer $TOKEN" $API/usage/stats)
check "用量统计(Bearer)"    "echo '$STATS' | grep -o 'total_requests'"                          "total_requests"
check "用量统计含quota"     "echo '$STATS' | grep -o 'quota'"                                   "quota"
check "quota含plan"         "echo '$STATS' | grep -o 'free'"                                    "free"

STATS_KEY=$(curl -s -H "X-API-Key: $API_KEY" $API/usage/stats)
check "用量统计(API Key)"   "echo '$STATS_KEY' | grep -o 'total_requests'"                        "total_requests"

# ========== 7. 套餐/Proxy/管理后台权限 ==========
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【7/7】套餐/Proxy/管理后台"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PLANS=$(curl -s -H "Authorization: Bearer $TOKEN" $API/plans)
check "套餐列表"            "echo '$PLANS' | grep -o 'free'"                                    "free"
check "套餐含pro"           "echo '$PLANS' | grep -o 'pro'"                                     "pro"
check "套餐含team"          "echo '$PLANS' | grep -o 'team'"                                    "team"

PROXY=$(curl -s $API_BASE/api/v1/proxy/providers)
check "Proxy Providers"     "echo '$PROXY' | grep -o 'openai'"                                  "openai"
check "Proxy含anthropic"    "echo '$PROXY' | grep -o 'anthropic'"                               "anthropic"
check "Proxy含deepseek"     "echo '$PROXY' | grep -o 'deepseek'"                               "deepseek"

ADMIN=$(curl -s -H "Authorization: Bearer $TOKEN" $API/admin/dashboard)
check "普通用户无管理权限"  "echo '$ADMIN' | grep -o '403'"                                     "403"

# ========== 结果汇总 ==========
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          自检完成"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 测试结果:"
echo "   ✅ 通过: $PASS"
echo "   ❌ 失败: $FAIL"
echo "   📋 总计: $TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 所有测试通过！TokenSaver 系统运行正常。"
    echo ""
    echo "📍 访问地址:"
    echo "   前端: https://tokesave.com"
    echo "   后端: https://tokensave-production.up.railway.app"
    echo "   API文档: https://tokensave-production.up.railway.app/docs"
    echo ""
    echo "🔧 可用功能:"
    echo "   - 用户注册/登录"
    echo "   - API Key创建/管理"
    echo "   - 消息压缩(60-95%压缩率)"
    echo "   - 用量统计(日/月/配额)"
    echo "   - Proxy模式(OpenAI/Anthropic/DeepSeek)"
    echo "   - 管理后台(管理员权限)"
    echo "   - 4种套餐(免费/专业/团队/企业)"
    exit 0
else
    echo "⚠️  有 $FAIL 项测试失败，请检查。"
    exit 1
fi
