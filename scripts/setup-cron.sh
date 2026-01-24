#!/bin/bash
# 设置定时监控任务

echo "========== 设置定时监控任务 =========="
echo ""

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then
  echo "请使用 sudo 运行此脚本"
  exit 1
fi

# 定义cron任务
CRON_JOB_SAVE="*/5 * * * * bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s >> /var/log/rehab-care-link/cron.log 2>&1"
CRON_JOB_REPORT="0 */6 * * * bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh > /var/log/rehab-care-link/report-\$(date +\\%Y\\%m\\%d-\\%H\\%M).log 2>&1"

echo "将要添加以下定时任务："
echo ""
echo "1. 每5分钟保存一次监控记录:"
echo "   $CRON_JOB_SAVE"
echo ""
echo "2. 每6小时生成一次完整报告:"
echo "   $CRON_JOB_REPORT"
echo ""

read -p "是否继续？ (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 1
fi

# 创建日志目录
mkdir -p /var/log/rehab-care-link

# 备份当前crontab
crontab -l > /tmp/crontab.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 移除旧的监控任务
crontab -l 2>/dev/null | grep -v "rehab-care-link/scripts/monitor" > /tmp/crontab.new || touch /tmp/crontab.new

# 添加新任务
echo "" >> /tmp/crontab.new
echo "# 康复云查房助手 - 监控任务" >> /tmp/crontab.new
echo "$CRON_JOB_SAVE" >> /tmp/crontab.new
echo "$CRON_JOB_REPORT" >> /tmp/crontab.new

# 安装新crontab
crontab /tmp/crontab.new

echo ""
echo "========== 定时任务已设置 =========="
echo ""
echo "当前crontab内容："
crontab -l | grep -A 3 "康复云查房助手"

echo ""
echo "========== 日志位置 =========="
echo "定时任务日志: /var/log/rehab-care-link/cron.log"
echo "监控报告: /var/log/rehab-care-link/report-*.log"
echo "监控历史: /var/log/rehab-care-link/monitor-history.log"

echo ""
echo "========== 管理命令 =========="
echo "查看crontab: crontab -l"
echo "编辑crontab: crontab -e"
echo "查看日志: tail -f /var/log/rehab-care-link/cron.log"
echo "查看历史: bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh"

echo ""
echo "========== 测试定时任务 =========="
echo "手动执行保存记录:"
echo "bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s"

# 清理临时文件
rm -f /tmp/crontab.new

echo ""
echo "设置完成！"
