#!/bin/bash
# 实时监控脚本

while true; do
  clear
  echo "========== 康复云查房助手 - 实时监控 =========="
  echo "时间: $(date)"
  echo ""

  echo "1. PM2进程状态:"
  pm2 list | grep rehab-care-link-server

  echo ""
  echo "2. 最新5行日志:"
  pm2 logs rehab-care-link-server --lines 5 --nostream

  echo ""
  echo "3. 错误统计:"
  ERROR_COUNT=$(pm2 logs rehab-care-link-server --err --lines 10 --nostream 2>/dev/null | wc -l)
  echo "最近10行错误日志数: $ERROR_COUNT"

  echo ""
  echo "4. API健康检查:"
  curl -s -o /dev/null -w "状态码: %{http_code}\n" http://localhost:3201/

  sleep 5
done
