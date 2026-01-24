#!/bin/bash
# 一次性监控报告 - 适合在CI/CD中使用

echo "========== 康复云查房助手 - 监控报告 =========="
echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. PM2进程列表"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. 系统资源"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CPU使用率:"
top -bn1 | grep "Cpu(s)"

echo ""
echo "内存使用:"
free -h

echo ""
echo "磁盘使用:"
df -h /

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. 进程详细信息"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 show rehab-care-link-server 2>/dev/null || echo "进程不存在"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. 最近日志 (最新20行)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs rehab-care-link-server --lines 20 --nostream 2>/dev/null || echo "无日志"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. 错误日志 (最新10行)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs rehab-care-link-server --err --lines 10 --nostream 2>/dev/null || echo "无错误日志"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. API健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 主页检查
echo "测试主页..."
curl -s -o /tmp/index.html -w "HTTP状态码: %{http_code}\n响应时间: %{time_total}s\n" http://localhost:3201/

# API检查
echo ""
echo "测试患者API..."
curl -s -w "HTTP状态码: %{http_code}\n" http://localhost:3201/api/patients

echo ""
echo "测试健康检查端点..."
curl -s http://localhost:3201/health 2>/dev/null || echo "健康检查端点不存在"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. 网络状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "端口3201监听状态:"
netstat -tlnp 2>/dev/null | grep ":3201" || ss -tlnp 2>/dev/null | grep ":3201" || echo "未找到端口3201"

echo ""
echo "活动连接:"
netstat -an 2>/dev/null | grep ":3201" | grep ESTABLISHED | wc -l | awk '{print $1 " 个活动连接"}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. 文件检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "数据库文件:"
ls -lh /www/wwwroot/rehab-care-link/backend/database.db 2>/dev/null || echo "数据库文件不存在"

echo ""
echo "服务器文件:"
ls -lh /www/wwwroot/rehab-care-link/backend/server.js 2>/dev/null || echo "服务器文件不存在"

echo ""
echo "前端文件:"
ls -lh /www/wwwroot/rehab-care-link/frontend/index.html 2>/dev/null || echo "前端文件不存在"

echo ""
echo "========== 监控报告生成完成 =========="
