#!/bin/bash
# 监控历史记录查看器

LOG_DIR="/var/log/rehab-care-link"
HISTORY_FILE="${LOG_DIR}/monitor-history.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 确保日志目录存在
mkdir -p "$LOG_DIR"

# 显示帮助信息
show_help() {
  echo "监控历史记录查看器"
  echo ""
  echo "用法: $0 [选项]"
  echo ""
  echo "选项:"
  echo "  -h, --help          显示此帮助信息"
  echo "  -l, --last N        显示最近 N 条记录 (默认: 10)"
  echo "  -t, --tail          实时跟踪新记录"
  echo "  -s, --save          保存新的监控记录"
  echo "  -e, --errors        只显示错误记录"
  echo "  -d, --date DATE     显示指定日期的记录 (格式: YYYY-MM-DD)"
  echo "  -c, --clear         清除历史记录"
  echo ""
  echo "示例:"
  echo "  $0 -l 20            # 显示最近20条记录"
  echo "  $0 -s               # 保存当前监控状态"
  echo "  $0 -t               # 实时查看新记录"
  echo "  $0 -e               # 只看错误"
}

# 保存监控记录
save_record() {
  echo "========== 保存监控记录 =========="

  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # 获取PM2状态
  PM2_STATUS=$(pm2 list | grep rehab-care-link-server | awk '{print $10}')
  if [ -z "$PM2_STATUS" ]; then
    PM2_STATUS="NOT_RUNNING"
  fi

  # 获取错误数
  ERROR_COUNT=$(pm2 logs rehab-care-link-server --err --lines 10 --nostream 2>/dev/null | wc -l)

  # 获取API状态
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3201/ 2>/dev/null || echo "000")

  # 获取系统资源
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
  MEM_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2 }')

  # 保存记录
  RECORD="${TIMESTAMP}|PM2=${PM2_STATUS}|ERRORS=${ERROR_COUNT}|API=${API_STATUS}|CPU=${CPU_USAGE}%|MEM=${MEM_USAGE}%"

  echo "$RECORD" >> "$HISTORY_FILE"

  echo -e "${GREEN}记录已保存${NC}"
  echo "$RECORD"
}

# 显示记录
show_records() {
  local count=${1:-10}

  if [ ! -f "$HISTORY_FILE" ]; then
    echo -e "${YELLOW}没有历史记录${NC}"
    return
  fi

  echo "========== 最近 $count 条监控记录 =========="
  echo ""

  tail -n "$count" "$HISTORY_FILE" | while IFS='|' read -r timestamp pm2 errors api cpu mem; do
    # 解析字段
    pm2_status=$(echo "$pm2" | cut -d'=' -f2)
    error_count=$(echo "$errors" | cut -d'=' -f2)
    api_code=$(echo "$api" | cut -d'=' -f2)
    cpu_val=$(echo "$cpu" | cut -d'=' -f2)
    mem_val=$(echo "$mem" | cut -d'=' -f2)

    # 根据状态设置颜色
    if [ "$pm2_status" = "online" ] && [ "$api_code" = "200" ]; then
      status_color=$GREEN
      status_icon="✓"
    else
      status_color=$RED
      status_icon="✗"
    fi

    # 显示记录
    echo -e "${status_color}${status_icon}${NC} $timestamp"
    echo "   PM2: $pm2_status | API: $api_code | 错误: $error_count | CPU: $cpu_val | 内存: $mem_val"
    echo ""
  done
}

# 显示错误记录
show_errors() {
  if [ ! -f "$HISTORY_FILE" ]; then
    echo -e "${YELLOW}没有历史记录${NC}"
    return
  fi

  echo "========== 错误记录 =========="
  echo ""

  grep -v "PM2=online|ERRORS=0|API=200" "$HISTORY_FILE" | tail -n 20 | while IFS='|' read -r timestamp pm2 errors api cpu mem; do
    echo -e "${RED}✗${NC} $timestamp"
    echo "   $pm2 | $errors | $api | $cpu | $mem"
    echo ""
  done
}

# 按日期显示
show_by_date() {
  local date=$1

  if [ ! -f "$HISTORY_FILE" ]; then
    echo -e "${YELLOW}没有历史记录${NC}"
    return
  fi

  echo "========== $date 的监控记录 =========="
  echo ""

  grep "^$date" "$HISTORY_FILE" | while IFS='|' read -r timestamp pm2 errors api cpu mem; do
    echo "$timestamp"
    echo "   $pm2 | $errors | $api | $cpu | $mem"
    echo ""
  done
}

# 实时跟踪
tail_records() {
  echo "========== 实时监控记录 (按 Ctrl+C 退出) =========="
  echo ""

  # 如果文件不存在，创建它
  touch "$HISTORY_FILE"

  # 实时跟踪
  tail -f "$HISTORY_FILE" | while IFS='|' read -r timestamp pm2 errors api cpu mem; do
    pm2_status=$(echo "$pm2" | cut -d'=' -f2)
    api_code=$(echo "$api" | cut -d'=' -f2)

    if [ "$pm2_status" = "online" ] && [ "$api_code" = "200" ]; then
      status_color=$GREEN
      status_icon="✓"
    else
      status_color=$RED
      status_icon="✗"
    fi

    echo -e "${status_color}${status_icon}${NC} $timestamp | $pm2 | $errors | $api | $cpu | $mem"
  done
}

# 清除记录
clear_records() {
  read -p "确认清除所有历史记录？ (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 备份
    if [ -f "$HISTORY_FILE" ]; then
      cp "$HISTORY_FILE" "${HISTORY_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
      echo -e "${GREEN}已备份到${NC} ${HISTORY_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # 清除
    > "$HISTORY_FILE"
    echo -e "${GREEN}历史记录已清除${NC}"
  else
    echo "已取消"
  fi
}

# 主程序
case "${1}" in
  -h|--help)
    show_help
    ;;
  -s|--save)
    save_record
    ;;
  -l|--last)
    show_records "${2:-10}"
    ;;
  -t|--tail)
    tail_records
    ;;
  -e|--errors)
    show_errors
    ;;
  -d|--date)
    show_by_date "$2"
    ;;
  -c|--clear)
    clear_records
    ;;
  *)
    # 默认显示最近10条记录
    show_records 10
    ;;
esac
