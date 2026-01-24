#!/bin/bash

###############################################################################
# 错误处理和回滚系统 - 快速设置脚本
# 用于初始化系统的所有必需组件
###############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "======================================"
echo "错误处理和回滚系统 - 快速设置"
echo "======================================"
echo ""

# 1. 检查必要的命令
log_info "检查必要的命令..."
commands=("curl" "pm2" "node" "npm")
missing_commands=()

for cmd in "${commands[@]}"; do
    if command -v "$cmd" &> /dev/null; then
        log_success "$cmd 已安装"
    else
        log_warn "$cmd 未安装"
        missing_commands+=("$cmd")
    fi
done

if [ ${#missing_commands[@]} -gt 0 ]; then
    log_error "缺少必要的命令: ${missing_commands[*]}"
    log_info "请先安装缺少的命令，然后重新运行此脚本"
    exit 1
fi

# 2. 检查可选命令
log_info "检查可选命令..."
if command -v sqlite3 &> /dev/null; then
    log_success "sqlite3 已安装（推荐）"
else
    log_warn "sqlite3 未安装（推荐安装以支持完整性检查）"
    log_info "安装命令: apt-get install sqlite3 或 yum install sqlite"
fi

if command -v gzip &> /dev/null; then
    log_success "gzip 已安装（支持备份压缩）"
else
    log_warn "gzip 未安装（备份将不会压缩）"
fi

echo ""

# 3. 创建必要的目录
log_info "创建必要的目录..."
directories=(
    "/www/backup/rehab-care-link/db"
    "/www/backup/rehab-care-link/rollback"
    "/www/wwwroot/rehab-care-link/server/data"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        if mkdir -p "$dir" 2>/dev/null; then
            log_success "已创建目录: $dir"
        else
            log_warn "无法创建目录: $dir（可能需要sudo权限）"
            log_info "请手动运行: sudo mkdir -p $dir"
        fi
    else
        log_success "目录已存在: $dir"
    fi
done

echo ""

# 4. 设置脚本权限
log_info "设置脚本执行权限..."
scripts=(
    "scripts/backup-db.sh"
    "scripts/test-error-handling.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        log_success "已设置执行权限: $script"
    else
        log_warn "脚本不存在: $script"
    fi
done

echo ""

# 5. 测试备份脚本
log_info "测试备份脚本..."
if [ -f "scripts/backup-db.sh" ]; then
    if bash -n scripts/backup-db.sh; then
        log_success "备份脚本语法正确"
    else
        log_error "备份脚本语法错误"
        exit 1
    fi
else
    log_error "备份脚本不存在"
    exit 1
fi

echo ""

# 6. 配置环境变量
log_info "检查环境变量配置..."
if [ -f ".env" ]; then
    log_success ".env 文件存在"

    # 检查关键环境变量
    required_vars=("PORT" "DASHSCOPE_API_KEY")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            log_success "环境变量已配置: $var"
        else
            log_warn "环境变量未配置: $var"
        fi
    done
else
    log_warn ".env 文件不存在"
    log_info "请创建 .env 文件并配置必要的环境变量"
fi

echo ""

# 7. 检查GitHub Secrets
log_info "检查GitHub配置..."
log_warn "请确保在GitHub仓库设置中配置以下Secrets:"
echo "  - DOMAIN          (域名)"
echo "  - HOST            (服务器IP)"
echo "  - USERNAME        (SSH用户名)"
echo "  - SSH_PRIVATE_KEY (SSH私钥)"
log_info "配置路径: Settings → Secrets and variables → Actions"

echo ""

# 8. 设置crontab (可选)
log_info "设置定时备份任务..."
read -p "是否设置每天凌晨2点的自动备份? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CRON_JOB="0 2 * * * $(pwd)/scripts/backup-db.sh >> /www/backup/rehab-care-link/cron.log 2>&1"

    # 检查crontab是否已存在
    if crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
        log_warn "备份任务已存在于crontab中"
    else
        # 添加到crontab
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        log_success "已添加定时备份任务到crontab"
        log_info "查看crontab: crontab -l"
    fi
else
    log_info "跳过crontab设置"
    log_info "您可以稍后手动设置: crontab -e"
    log_info "添加以下行:"
    echo "  0 2 * * * $(pwd)/scripts/backup-db.sh >> /www/backup/rehab-care-link/cron.log 2>&1"
fi

echo ""

# 9. 运行测试
log_info "运行系统测试..."
read -p "是否运行测试脚本验证系统? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "scripts/test-error-handling.sh" ]; then
        log_info "开始运行测试..."
        echo ""
        ./scripts/test-error-handling.sh
    else
        log_error "测试脚本不存在"
    fi
else
    log_info "跳过测试"
    log_info "您可以稍后运行: ./scripts/test-error-handling.sh"
fi

echo ""

# 10. 创建初始备份
log_info "创建初始数据库备份..."
read -p "是否立即创建数据库备份? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "scripts/backup-db.sh" ]; then
        log_info "执行备份..."
        ./scripts/backup-db.sh
    else
        log_error "备份脚本不存在"
    fi
else
    log_info "跳过初始备份"
    log_info "您可以稍后运行: ./scripts/backup-db.sh"
fi

echo ""
echo "======================================"
echo "设置完成！"
echo "======================================"
echo ""

log_success "系统已初始化完成"
echo ""
echo "下一步:"
echo "  1. 确保GitHub Secrets已配置"
echo "  2. 查看文档: docs/error-handling-rollback.md"
echo "  3. 查看快速参考: docs/quick-reference.md"
echo "  4. 运行测试: ./scripts/test-error-handling.sh"
echo "  5. 执行备份: ./scripts/backup-db.sh"
echo ""
echo "监控命令:"
echo "  - 查看健康状态: curl http://localhost:3201/api/health"
echo "  - 查看PM2状态: pm2 list"
echo "  - 查看备份日志: cat /www/backup/rehab-care-link/db/backup.log"
echo "  - 查看回滚日志: cat /www/wwwroot/rehab-care-link/rollback-log.txt"
echo ""
log_info "如有问题，请查看文档或运行: ./scripts/backup-db.sh --help"
echo ""
