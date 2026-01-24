#!/bin/bash

###############################################################################
# 错误处理系统测试脚本
# 用于测试健康检查、错误处理和回滚功能
###############################################################################

set -euo pipefail

# 配置
API_URL="${API_URL:-http://localhost:3201}"
DOMAIN="${DOMAIN:-localhost}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试计数器
PASSED=0
FAILED=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED=$((PASSED + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED=$((FAILED + 1))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 测试健康检查端点
test_health_endpoint() {
    log_info "测试健康检查端点..."

    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/health" || echo "000")
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)

    if [ "$status" = "200" ]; then
        log_success "健康检查端点返回200"

        # 检查响应内容
        if echo "$body" | grep -q '"status".*"ok"'; then
            log_success "健康检查状态: ok"
        else
            log_fail "健康检查状态异常: $body"
        fi

        if echo "$body" | grep -q '"db".*"ok"'; then
            log_success "数据库连接: ok"
        else
            log_fail "数据库连接异常: $body"
        fi
    else
        log_fail "健康检查端点返回 $status"
    fi
}

# 测试404错误处理
test_404_handling() {
    log_info "测试404错误处理..."

    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/nonexistent" || echo "000")
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)

    if [ "$status" = "404" ]; then
        log_success "404错误返回正确的状态码"

        if echo "$body" | grep -q '"success".*false'; then
            log_success "404响应包含 success: false"
        else
            log_fail "404响应格式错误: $body"
        fi

        if echo "$body" | grep -q '"error"'; then
            log_success "404响应包含错误信息"
        else
            log_fail "404响应缺少错误信息: $body"
        fi
    else
        log_fail "404错误返回错误的状态码: $status"
    fi
}

# 测试无效请求处理
test_invalid_request() {
    log_info "测试无效请求处理..."

    # 测试创建患者时缺少必需字段
    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "$API_URL/api/patients" \
        -H "Content-Type: application/json" \
        -d '{}' || echo "000")

    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)

    if [ "$status" = "400" ]; then
        log_success "无效请求返回400"

        if echo "$body" | grep -q '"success".*false'; then
            log_success "无效请求响应包含 success: false"
        else
            log_fail "无效请求响应格式错误: $body"
        fi
    else
        log_fail "无效请求返回错误的状态码: $status"
    fi
}

# 测试大文件上传限制
test_file_size_limit() {
    log_info "测试文件大小限制..."

    # 创建一个临时的大文件（16MB，超过15MB限制）
    local temp_file=$(mktemp)
    dd if=/dev/zero of="$temp_file" bs=1M count=16 2>/dev/null

    local response=$(curl -s -w "\n%{http_code}" -X POST \
        "$API_URL/api/cases" \
        -F "files=@$temp_file" || echo "000")

    local status=$(echo "$response" | tail -n 1)

    # 清理临时文件
    rm -f "$temp_file"

    if [ "$status" = "413" ]; then
        log_success "超大文件被拒绝（413）"
    else
        log_warn "文件大小限制测试返回: $status（预期413）"
    fi
}

# 测试CORS
test_cors() {
    log_info "测试CORS配置..."

    local response=$(curl -s -I "$API_URL/api/health" | grep -i "access-control" || echo "")

    if [ -n "$response" ]; then
        log_success "CORS头已配置"
        echo "$response"
    else
        log_warn "未检测到CORS头（可能需要配置）"
    fi
}

# 测试数据库备份脚本
test_backup_script() {
    log_info "测试数据库备份脚本..."

    local script_path="./scripts/backup-db.sh"

    if [ ! -f "$script_path" ]; then
        log_fail "备份脚本不存在: $script_path"
        return
    fi

    if [ -x "$script_path" ]; then
        log_success "备份脚本有执行权限"
    else
        log_warn "备份脚本没有执行权限"
    fi

    # 检查脚本语法
    if bash -n "$script_path" 2>/dev/null; then
        log_success "备份脚本语法正确"
    else
        log_fail "备份脚本语法错误"
    fi

    # 测试帮助选项
    if "$script_path" --help &>/dev/null; then
        log_success "备份脚本 --help 选项工作正常"
    else
        log_warn "备份脚本 --help 选项可能需要检查"
    fi
}

# 测试患者API
test_patient_api() {
    log_info "测试患者API..."

    # 获取患者列表
    local response=$(curl -s -w "\n%{http_code}" "$API_URL/api/patients" || echo "000")
    local status=$(echo "$response" | tail -n 1)

    if [ "$status" = "200" ]; then
        log_success "获取患者列表成功"
    else
        log_fail "获取患者列表失败: $status"
    fi

    # 创建测试患者
    local create_response=$(curl -s -w "\n%{http_code}" -X POST \
        "$API_URL/api/patients" \
        -H "Content-Type: application/json" \
        -d '{
            "patient": {
                "name": "测试患者",
                "age": "30",
                "gender": "男",
                "bedNo": "101",
                "department": "康复科",
                "diagnosis": "测试诊断"
            }
        }' || echo "000")

    local create_status=$(echo "$create_response" | tail -n 1)

    if [ "$create_status" = "201" ]; then
        log_success "创建患者成功"

        # 提取患者ID
        local patient_id=$(echo "$create_response" | head -n -1 | grep -o '"patientId":[0-9]*' | cut -d: -f2)

        if [ -n "$patient_id" ]; then
            log_success "获取患者ID: $patient_id"

            # 删除测试患者
            local delete_status=$(curl -s -o /dev/null -w "%{http_code}" \
                -X DELETE "$API_URL/api/patients/$patient_id" || echo "000")

            if [ "$delete_status" = "204" ]; then
                log_success "删除测试患者成功"
            else
                log_warn "删除测试患者失败: $delete_status"
            fi
        else
            log_warn "未能提取患者ID"
        fi
    else
        log_fail "创建患者失败: $create_status"
    fi
}

# 测试工作流文件
test_workflow_files() {
    log_info "测试工作流文件..."

    local workflows=(
        ".github/workflows/health-check.yml"
        ".github/workflows/auto-rollback.yml"
    )

    for workflow in "${workflows[@]}"; do
        if [ -f "$workflow" ]; then
            log_success "工作流文件存在: $workflow"

            # 检查YAML语法（如果有yq或python）
            if command -v python3 &>/dev/null; then
                if python3 -c "import yaml; yaml.safe_load(open('$workflow'))" 2>/dev/null; then
                    log_success "工作流YAML语法正确: $workflow"
                else
                    log_fail "工作流YAML语法错误: $workflow"
                fi
            fi
        else
            log_fail "工作流文件不存在: $workflow"
        fi
    done
}

# 测试错误日志
test_error_logging() {
    log_info "测试错误日志..."

    # 触发一个错误并检查是否记录
    curl -s "$API_URL/api/nonexistent" >/dev/null 2>&1

    log_warn "请手动检查服务器日志是否记录了404错误"
}

# 压力测试
stress_test() {
    log_info "执行简单压力测试..."

    local requests=10
    local success=0

    for i in $(seq 1 $requests); do
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health" || echo "000")
        if [ "$status" = "200" ]; then
            success=$((success + 1))
        fi
    done

    if [ "$success" -eq "$requests" ]; then
        log_success "压力测试: $success/$requests 请求成功"
    else
        log_warn "压力测试: $success/$requests 请求成功"
    fi
}

# 显示测试摘要
show_summary() {
    echo ""
    echo "======================================"
    echo "测试摘要"
    echo "======================================"
    echo -e "${GREEN}通过: $PASSED${NC}"
    echo -e "${RED}失败: $FAILED${NC}"
    echo "总计: $((PASSED + FAILED))"
    echo "======================================"

    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}所有测试通过！${NC}"
        return 0
    else
        echo -e "${RED}部分测试失败，请检查日志${NC}"
        return 1
    fi
}

# 主函数
main() {
    echo "======================================"
    echo "错误处理系统测试"
    echo "======================================"
    echo "API URL: $API_URL"
    echo "Domain: $DOMAIN"
    echo "======================================"
    echo ""

    # 运行所有测试
    test_health_endpoint
    echo ""

    test_404_handling
    echo ""

    test_invalid_request
    echo ""

    test_file_size_limit
    echo ""

    test_cors
    echo ""

    test_backup_script
    echo ""

    test_patient_api
    echo ""

    test_workflow_files
    echo ""

    test_error_logging
    echo ""

    stress_test
    echo ""

    # 显示摘要
    show_summary
}

# 检查依赖
if ! command -v curl &>/dev/null; then
    echo "错误: curl 未安装"
    exit 1
fi

# 运行测试
main "$@"
