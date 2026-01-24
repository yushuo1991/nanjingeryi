#!/bin/bash

###############################################################################
# 数据库备份脚本
# 功能：定期备份SQLite数据库，保留最近N个备份
# 用法：./backup-db.sh [options]
###############################################################################

set -euo pipefail

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_PATH="${DB_PATH:-$PROJECT_ROOT/server/data/rehab.db}"
BACKUP_DIR="${BACKUP_DIR:-/www/backup/rehab-care-link/db}"
MAX_BACKUPS="${MAX_BACKUPS:-30}"  # 保留最近30个备份
LOG_FILE="${LOG_FILE:-$BACKUP_DIR/backup.log}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 错误处理
error_exit() {
    log_error "$1"
    exit 1
}

# 清理函数
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "备份过程中发生错误，退出码: $exit_code"
    fi
    exit $exit_code
}

trap cleanup EXIT

# 检查数据库文件是否存在
check_database() {
    log_info "检查数据库文件: $DB_PATH"

    if [ ! -f "$DB_PATH" ]; then
        error_exit "数据库文件不存在: $DB_PATH"
    fi

    # 检查数据库完整性
    if command -v sqlite3 &> /dev/null; then
        log_info "验证数据库完整性..."
        if ! sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
            error_exit "数据库完整性检查失败"
        fi
        log_success "数据库完整性验证通过"
    else
        log_warn "sqlite3命令不可用，跳过完整性检查"
    fi
}

# 创建备份目录
create_backup_dir() {
    log_info "创建备份目录: $BACKUP_DIR"

    if ! mkdir -p "$BACKUP_DIR"; then
        error_exit "无法创建备份目录: $BACKUP_DIR"
    fi

    log_success "备份目录已就绪"
}

# 执行备份
perform_backup() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/rehab_${timestamp}.db"
    local backup_info="$BACKUP_DIR/rehab_${timestamp}.info"

    log_info "开始备份数据库..."
    log_info "源文件: $DB_PATH"
    log_info "目标文件: $backup_file"

    # 如果sqlite3可用，使用.backup命令（更安全）
    if command -v sqlite3 &> /dev/null; then
        log_info "使用sqlite3 .backup命令进行备份..."

        if ! sqlite3 "$DB_PATH" ".backup '$backup_file'"; then
            error_exit "sqlite3备份失败"
        fi
    else
        log_warn "sqlite3不可用，使用文件复制方式备份"

        # 文件复制方式
        if ! cp -p "$DB_PATH" "$backup_file"; then
            error_exit "文件复制失败"
        fi
    fi

    # 验证备份文件
    if [ ! -f "$backup_file" ]; then
        error_exit "备份文件未创建: $backup_file"
    fi

    # 获取文件大小
    local original_size=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH" 2>/dev/null || echo "unknown")
    local backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "unknown")

    log_success "备份完成"
    log_info "原始大小: $original_size bytes"
    log_info "备份大小: $backup_size bytes"

    # 创建备份信息文件
    cat > "$backup_info" << EOF
备份时间: $(date '+%Y-%m-%d %H:%M:%S')
数据库路径: $DB_PATH
备份文件: $backup_file
原始大小: $original_size bytes
备份大小: $backup_size bytes
主机名: $(hostname)
用户: $(whoami)
EOF

    # 压缩备份（可选）
    if command -v gzip &> /dev/null && [ "${COMPRESS_BACKUP:-false}" = "true" ]; then
        log_info "压缩备份文件..."
        if gzip -9 "$backup_file"; then
            log_success "备份已压缩: ${backup_file}.gz"
            backup_file="${backup_file}.gz"
        else
            log_warn "压缩失败，保留未压缩文件"
        fi
    fi

    echo "$backup_file"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份（保留最近 $MAX_BACKUPS 个）..."

    cd "$BACKUP_DIR"

    # 计算需要删除的文件数量
    local total_backups=$(ls -1 rehab_*.db* 2>/dev/null | wc -l)

    if [ "$total_backups" -le "$MAX_BACKUPS" ]; then
        log_info "当前备份数: $total_backups，无需清理"
        return
    fi

    local to_delete=$((total_backups - MAX_BACKUPS))
    log_info "当前备份数: $total_backups，需要删除: $to_delete 个旧备份"

    # 删除最旧的备份
    local deleted=0
    ls -t rehab_*.db* 2>/dev/null | tail -n "+$((MAX_BACKUPS + 1))" | while read -r file; do
        if rm -f "$file" "${file%.db*}.info" 2>/dev/null; then
            log_info "已删除旧备份: $file"
            deleted=$((deleted + 1))
        else
            log_warn "删除失败: $file"
        fi
    done

    log_success "清理完成"
}

# 显示备份统计
show_backup_stats() {
    log_info "备份统计信息:"

    cd "$BACKUP_DIR"

    local total_count=$(ls -1 rehab_*.db* 2>/dev/null | wc -l)
    local total_size=0

    if command -v du &> /dev/null; then
        total_size=$(du -sh . 2>/dev/null | cut -f1)
    fi

    log_info "  - 总备份数: $total_count"
    log_info "  - 总占用空间: $total_size"

    if [ "$total_count" -gt 0 ]; then
        log_info "  - 最新备份: $(ls -t rehab_*.db* 2>/dev/null | head -n 1)"
        log_info "  - 最旧备份: $(ls -t rehab_*.db* 2>/dev/null | tail -n 1)"
    fi
}

# 验证备份
verify_backup() {
    local backup_file="$1"

    log_info "验证备份文件: $backup_file"

    # 如果是压缩文件，先解压
    local temp_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        temp_file="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$temp_file"
    fi

    # 使用sqlite3验证
    if command -v sqlite3 &> /dev/null; then
        if sqlite3 "$temp_file" "PRAGMA integrity_check;" | grep -q "ok"; then
            log_success "备份验证成功"
        else
            log_error "备份验证失败"
            [ "$temp_file" != "$backup_file" ] && rm -f "$temp_file"
            return 1
        fi
    fi

    # 清理临时文件
    [ "$temp_file" != "$backup_file" ] && rm -f "$temp_file"

    return 0
}

# 主函数
main() {
    log_info "=========================================="
    log_info "开始数据库备份任务"
    log_info "=========================================="

    # 检查数据库
    check_database

    # 创建备份目录
    create_backup_dir

    # 执行备份
    local backup_file=$(perform_backup)

    # 验证备份
    if ! verify_backup "$backup_file"; then
        error_exit "备份验证失败，请检查备份文件"
    fi

    # 清理旧备份
    cleanup_old_backups

    # 显示统计
    show_backup_stats

    log_info "=========================================="
    log_success "数据库备份任务完成"
    log_info "=========================================="
}

# 显示帮助
show_help() {
    cat << EOF
数据库备份脚本

用法: $0 [options]

选项:
  -h, --help              显示此帮助信息
  -d, --database PATH     指定数据库路径（默认: $DB_PATH）
  -b, --backup-dir PATH   指定备份目录（默认: $BACKUP_DIR）
  -m, --max-backups NUM   保留的最大备份数（默认: $MAX_BACKUPS）
  -c, --compress          压缩备份文件
  -v, --verify            仅验证现有备份

环境变量:
  DB_PATH                 数据库文件路径
  BACKUP_DIR              备份目录路径
  MAX_BACKUPS             保留的最大备份数
  COMPRESS_BACKUP         是否压缩备份（true/false）

示例:
  $0                                          # 使用默认配置执行备份
  $0 -c                                       # 执行备份并压缩
  $0 -d /path/to/db.db -b /backup/dir       # 指定路径
  $0 -m 50                                    # 保留50个备份

EOF
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--database)
            DB_PATH="$2"
            shift 2
            ;;
        -b|--backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -m|--max-backups)
            MAX_BACKUPS="$2"
            shift 2
            ;;
        -c|--compress)
            COMPRESS_BACKUP=true
            shift
            ;;
        -v|--verify)
            # 仅验证模式
            log_info "验证现有备份..."
            cd "$BACKUP_DIR"
            for backup in rehab_*.db*; do
                if [ -f "$backup" ]; then
                    verify_backup "$backup"
                fi
            done
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行主函数
main
