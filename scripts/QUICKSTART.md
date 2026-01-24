# 监控脚本快速上手指南

## 一分钟快速开始

### 1. 部署监控脚本

**方式A: 通过 GitHub Actions (推荐)**
1. 打开 https://github.com/你的用户名/rehab-care-link/actions
2. 选择 "部署监控脚本" workflow
3. 点击 "Run workflow" → "Run workflow"
4. 等待约1分钟完成部署

**方式B: 手动部署**
```bash
# 登录服务器
ssh root@你的服务器

# 克隆或更新代码
cd /www/wwwroot/rehab-care-link
git pull

# 设置权限
chmod +x scripts/monitor*.sh scripts/setup-cron.sh
```

---

### 2. 立即开始监控

```bash
# SSH 登录服务器
ssh root@你的服务器

# 查看实时监控 (每5秒刷新)
bash /www/wwwroot/rehab-care-link/scripts/monitor-enhanced.sh

# 按 Ctrl+C 退出
```

---

### 3. 生成一次性报告

```bash
# 生成当前状态报告
bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh

# 保存报告到文件
bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh > /tmp/report.txt
```

---

### 4. 设置自动监控 (可选)

```bash
# 设置定时任务（每5分钟保存快照，每6小时生成报告）
sudo bash /www/wwwroot/rehab-care-link/scripts/setup-cron.sh

# 查看监控历史
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -l 20

# 实时查看新记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -t
```

---

## 常用命令速查

### 实时监控
```bash
# 基础版 (简洁)
bash /www/wwwroot/rehab-care-link/scripts/monitor.sh

# 增强版 (详细)
bash /www/wwwroot/rehab-care-link/scripts/monitor-enhanced.sh
```

### 一次性报告
```bash
# 屏幕输出
bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh

# 保存到文件
bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh > /tmp/report-$(date +%Y%m%d_%H%M).txt
```

### 历史记录
```bash
# 保存快照
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s

# 查看最近10条
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh

# 查看最近100条
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -l 100

# 只看错误
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -e

# 查看今天的记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -d $(date +%Y-%m-%d)

# 实时跟踪
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -t
```

---

## 使用快捷命令 (部署后自动配置)

部署完成后，重新登录 SSH，可以使用以下快捷命令:

```bash
# 重新登录
exit
ssh root@你的服务器

# 使用快捷命令
monitor              # 基础监控
monitor-enhanced     # 增强监控
monitor-once         # 一次性报告
monitor-report       # 同上
```

---

## 后台运行监控

使用 `screen` 或 `tmux` 在后台运行:

```bash
# 使用 screen
screen -S monitor
bash /www/wwwroot/rehab-care-link/scripts/monitor-enhanced.sh

# 分离: Ctrl+A, 然后按 D
# 恢复: screen -r monitor

# 使用 tmux
tmux new -s monitor
bash /www/wwwroot/rehab-care-link/scripts/monitor-enhanced.sh

# 分离: Ctrl+B, 然后按 D
# 恢复: tmux attach -t monitor
```

---

## 定时任务配置

### 自动设置 (推荐)
```bash
sudo bash /www/wwwroot/rehab-care-link/scripts/setup-cron.sh
```

### 手动设置
```bash
crontab -e

# 添加以下内容:
*/5 * * * * bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s >> /var/log/rehab-care-link/cron.log 2>&1
0 */6 * * * bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh > /var/log/rehab-care-link/report-$(date +\%Y\%m\%d-\%H\%M).log 2>&1
```

### 查看定时任务
```bash
# 查看当前 crontab
crontab -l

# 查看定时任务日志
tail -f /var/log/rehab-care-link/cron.log

# 查看生成的报告
ls -lh /var/log/rehab-care-link/report-*.log
```

---

## 故障排查

### 脚本无法执行
```bash
chmod +x /www/wwwroot/rehab-care-link/scripts/monitor*.sh
```

### PM2 命令不存在
```bash
npm install -g pm2
```

### 快捷命令不生效
```bash
source ~/.bashrc
# 或重新登录
```

---

## 监控指标说明

### 状态码含义
- `HTTP 200`: 正常
- `HTTP 404`: 页面不存在
- `HTTP 500`: 服务器错误
- `Connection refused`: 服务未启动

### PM2 状态
- `online`: 运行正常
- `stopped`: 已停止
- `errored`: 运行错误

### 资源警告阈值
- CPU > 80%: 需要关注
- 内存 > 80%: 需要关注
- 磁盘 > 90%: 需要清理

---

## 更多帮助

完整文档: `C:/Users/yushu/Desktop/rehab-care-link/scripts/README.md`

或在服务器上: `/www/wwwroot/rehab-care-link/scripts/README.md`

---

**最后更新:** 2026-01-24
