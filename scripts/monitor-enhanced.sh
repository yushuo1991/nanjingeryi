#!/bin/bash
# 增强版监控脚本 - 带更多指标

while true; do
  clear
  echo "========== 康复云查房助手 - 实时监控 =========="
  echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "1. PM2进程状态"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  pm2 list | grep -E "rehab-care-link-server|id.*name.*mode"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "2. 系统资源使用"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  # CPU和内存
  top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU使用率: " 100 - $1 "%"}'
  free -m | awk 'NR==2{printf "内存使用: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'
  df -h / | awk 'NR==2{printf "磁盘使用: %s/%s (%s)\n", $3,$2,$5}'

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "3. 进程详细信息"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  pm2 show rehab-care-link-server 2>/dev/null | grep -E "uptime|restart|cpu|memory|status" || echo "无法获取进程详情"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "4. 最新日志 (5行)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  pm2 logs rehab-care-link-server --lines 5 --nostream 2>/dev/null || echo "无法获取日志"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "5. 错误统计"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ERROR_COUNT=$(pm2 logs rehab-care-link-server --err --lines 20 --nostream 2>/dev/null | wc -l)
  echo "最近20行错误日志数: $ERROR_COUNT"

  if [ $ERROR_COUNT -gt 0 ]; then
    echo "最新错误："
    pm2 logs rehab-care-link-server --err --lines 3 --nostream 2>/dev/null
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "6. API健康检查"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 检查主页
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3201/)
  RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3201/)
  echo "主页: HTTP $HTTP_CODE (响应时间: ${RESPONSE_TIME}s)"

  # 检查API端点
  API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3201/api/patients)
  echo "患者API: HTTP $API_CODE"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "7. 网络连接"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  CONNECTIONS=$(netstat -an 2>/dev/null | grep ":3201" | grep ESTABLISHED | wc -l)
  echo "活动连接数: $CONNECTIONS"

  echo ""
  echo "按 Ctrl+C 退出监控 | 每5秒自动刷新"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  sleep 5
done
