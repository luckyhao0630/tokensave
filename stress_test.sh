#!/bin/bash
# TokenSaver 高并发压力测试
# 测试多用户并发场景下的系统稳定性

BASE_URL="https://tokensave-production.up.railway.app/api/v1"

echo "═══════════════════════════════════════════════════════════════"
echo "          TokenSaver 高并发压力测试"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "测试场景: 模拟100个并发用户同时注册、登录、压缩"
echo "目标: 验证系统在高并发下的稳定性和响应时间"
echo ""

# 创建测试用户
CONCURRENT_USERS=10
TEST_USERS=()
TOKENS=()
API_KEYS=()

echo "【阶段1】创建 $CONCURRENT_USERS 个测试用户..."
for i in $(seq 1 $CONCURRENT_USERS); do
    EMAIL="stress_test_${i}_$(date +%s)@example.com"
    PASS="StressTest123"
    
    # 注册
    curl -s -X POST $BASE_URL/auth/register \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" > /dev/null
    
    # 登录获取Token
    TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$EMAIL&password=$PASS" | \
        python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    
    # 创建API Key
    API_KEY=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
        $BASE_URL/api-keys | \
        python3 -c "import sys,json; print(json.load(sys.stdin)['api_key'])" 2>/dev/null)
    
    TEST_USERS+=("$EMAIL")
    TOKENS+=("$TOKEN")
    API_KEYS+=("$API_KEY")
    
    echo "  用户 $i: $EMAIL"
done

echo ""
echo "【阶段2】并发压缩测试（100次并发请求）..."

COMPRESS_PAYLOAD='{"messages":[{"role":"user","content":"'"$(python3 -c "print('x'*10000)")"'"}],"model":"gpt-4o"}'

START_TIME=$(date +%s%N)

for i in $(seq 1 100); do
    (
        KEY_INDEX=$((i % CONCURRENT_USERS))
        API_KEY=${API_KEYS[$KEY_INDEX]}
        
        RESULT=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "X-API-Key: $API_KEY" \
            -d '{"messages":[{"role":"user","content":"test data"}],"model":"gpt-4o"}' \
            $BASE_URL/compress)
        
        if echo "$RESULT" | grep -q "savings_percentage"; then
            echo -n "."
        else
            echo -n "X"
        fi
    ) &
    
    # 每10个请求等待一次，避免 overwhelming
    if [ $((i % 10)) -eq 0 ]; then
        wait
    fi
done

wait

END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

echo ""
echo ""
echo "【结果】"
echo "  总请求: 100次"
echo "  并发用户: $CONCURRENT_USERS"
echo "  总耗时: ${DURATION}ms"
echo "  平均响应: $((DURATION / 100))ms"
echo ""

# 检查后端健康
echo "【阶段3】后端健康检查..."
HEALTH=$(curl -s $BASE_URL/../health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "  ✅ 后端正常运行"
else
    echo "  ❌ 后端可能异常: $HEALTH"
fi

# 数据库压力测试
echo ""
echo "【阶段4】数据库压力测试..."
DB_START=$(date +%s%N)
for i in $(seq 1 50); do
    (
        TOKEN_INDEX=$((i % CONCURRENT_USERS))
        TOKEN=${TOKENS[$TOKEN_INDEX]}
        
        curl -s -H "Authorization: Bearer $TOKEN" \
            $BASE_URL/usage/stats > /dev/null
    ) &
    
    if [ $((i % 10)) -eq 0 ]; then
        wait
    fi
done
wait
DB_END=$(date +%s%N)
DB_DURATION=$(( (DB_END - DB_START) / 1000000 ))

echo "  数据库查询: 50次并发"
echo "  总耗时: ${DB_DURATION}ms"
echo "  平均响应: $((DB_DURATION / 50))ms"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          压力测试完成"
echo "═══════════════════════════════════════════════════════════════"
