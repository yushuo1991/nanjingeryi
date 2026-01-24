# 监控脚本使用指南

康复云查房助手提供了完整的监控工具集，用于实时监控服务器状态、记录历史数据和生成报告。

## 可用的监控脚本

### 1. `monitor.sh` - 基础实时监控

**功能:**
- PM2 进程状态
- 最新 5 行日志
- 错误统计
- API 健康检查
- 每 5 秒自动刷新

**使用方法:**
```bash
# 方式1: 直接运行
bash /www/wwwroot/rehab-care-link/scripts/monitor.sh

# 方式2: 使用快捷命令 (需要重新登录后生效)
monitor
```

**退出:** 按 `Ctrl+C`

---

### 2. `monitor-enhanced.sh` - 增强版监控

**功能:**
- PM2 进程状态和详细信息
- 系统资源使用 (CPU、内存、磁盘)
- 进程运行时间、重启次数
- 最新 5 行日志
- 错误统计和最新错误展示
- 多个 API 端点健康检查
- 网络活动连接数统计
- 每 5 秒自动刷新

**使用方法:**
```bash
# 方式1: 直接运行
bash /www/wwwroot/rehab-care-link/scripts/monitor-enhanced.sh

# 方式2: 使用快捷命令
monitor-enhanced
```

**退出:** 按 `Ctrl+C`

---

### 3. `monitor-once.sh` - 一次性监控报告

**功能:**
- 生成完整的监控报告
- 不循环，执行一次即退出
- 适合在 CI/CD 中使用
- 包含所有监控指标的详细信息

**包含内容:**
- PM2 进程列表
- 系统资源 (CPU、内存、磁盘)
- 进程详细信息
- 最近 20 行日志
- 最近 10 行错误日志
- API 健康检查
- 网络状态
- 关键文件检查

**使用方法:**
```bash
# 方式1: 直接运行
bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh

# 方式2: 使用快捷命令
monitor-once
# 或
monitor-report

# 方式3: 保存报告到文件
bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh > /tmp/monitor-report.txt
```

---

### 4. `monitor-history.sh` - 监控历史记录管理

**功能:**
- 保存监控快照到历史记录
- 查看历史监控数据
- 错误记录筛选
- 按日期查询
- 实时跟踪新记录

**使用方法:**
```bash
# 保存当前监控状态
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s

# 查看最近10条记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh

# 查看最近50条记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -l 50

# 只看错误记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -e

# 实时跟踪新记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -t

# 查看指定日期的记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -d 2026-01-24

# 清除历史记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -c
```

---

### 5. `setup-cron.sh` - 设置定时监控任务

**功能:**
- 自动设置定时监控任务
- 每5分钟保存监控快照
- 每6小时生成完整报告
- 自动备份现有crontab

**使用方法:**
```bash
# 需要root权限
sudo bash /www/wwwroot/rehab-care-link/scripts/setup-cron.sh
```

**定时任务说明:**
- 每5分钟: 保存监控快照到 `/var/log/rehab-care-link/monitor-history.log`
- 每6小时: 生成完整报告到 `/var/log/rehab-care-link/report-*.log`

---

## 快速部署

### 通过 GitHub Actions 部署

1. 访问项目的 Actions 页面
2. 选择 "部署监控脚本" workflow
3. 点击 "Run workflow" 按钮
4. 等待部署完成

### 手动部署

```bash
# 1. 上传脚本到服务器
scp scripts/monitor*.sh root@your-server:/www/wwwroot/rehab-care-link/scripts/

# 2. SSH 登录服务器
ssh root@your-server

# 3. 设置执行权限
cd /www/wwwroot/rehab-care-link
chmod +x scripts/monitor*.sh

# 4. 添加快捷命令到 .bashrc
cat >> ~/.bashrc << 'EOF'

# 康复云查房助手 - 监控脚本快捷命令
alias monitor='cd /www/wwwroot/rehab-care-link && bash scripts/monitor.sh'
alias monitor-enhanced='cd /www/wwwroot/rehab-care-link && bash scripts/monitor-enhanced.sh'
alias monitor-once='cd /www/wwwroot/rehab-care-link && bash scripts/monitor-once.sh'
alias monitor-report='cd /www/wwwroot/rehab-care-link && bash scripts/monitor-once.sh'
EOF

# 5. 重新加载配置
source ~/.bashrc
```

---

## 使用场景

### 1. 日常运维监控
使用 `monitor-enhanced` 实时查看服务器状态:
```bash
monitor-enhanced
```

### 2. 快速问题排查
使用 `monitor` 快速查看当前状态:
```bash
monitor
```

### 3. 生成诊断报告
使用 `monitor-once` 生成详细报告:
```bash
monitor-once > /tmp/diagnosis-$(date +%Y%m%d_%H%M%S).txt
```

### 4. CI/CD 集成
在 GitHub Actions 中使用 `monitor-once`:
```yaml
- name: 生成监控报告
  run: |
    ssh user@server "bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh"
```

### 5. 监控历史追踪
保存和查看历史监控数据:
```bash
# 定期保存快照
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s

# 查看历史趋势
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -l 100

# 分析错误模式
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -e
```

### 6. 自动化监控
使用定时任务自动监控:
```bash
# 设置定时任务
sudo bash /www/wwwroot/rehab-care-link/scripts/setup-cron.sh

# 查看监控历史
tail -f /var/log/rehab-care-link/monitor-history.log

# 查看报告
ls -lh /var/log/rehab-care-link/report-*.log
```

---

## 监控指标说明

### PM2 进程状态
- `online`: 运行正常
- `stopped`: 已停止
- `errored`: 运行错误
- `restart`: 重启次数

### 系统资源
- **CPU 使用率**: 应保持在 80% 以下
- **内存使用**: 应保持在 80% 以下
- **磁盘使用**: 应保持在 90% 以下

### API 健康检查
- **HTTP 200**: 正常
- **HTTP 404**: 路径不存在
- **HTTP 500**: 服务器错误
- **Connection refused**: 服务未启动

### 网络连接
- 显示当前活动的 HTTP 连接数
- 过多连接可能表示负载过高

---

## 故障排查

### 脚本无法执行
```bash
# 检查文件权限
ls -l /www/wwwroot/rehab-care-link/scripts/monitor*.sh

# 重新设置权限
chmod +x /www/wwwroot/rehab-care-link/scripts/monitor*.sh
```

### PM2 命令不存在
```bash
# 安装 PM2
npm install -g pm2

# 或使用完整路径
/usr/local/bin/pm2 list
```

### 快捷命令不生效
```bash
# 重新加载 .bashrc
source ~/.bashrc

# 或重新登录 SSH
exit
ssh root@your-server
```

---

## 自定义监控

你可以根据需要修改脚本，添加自定义的监控指标:

```bash
# 编辑脚本
vi /www/wwwroot/rehab-care-link/scripts/monitor.sh

# 添加自定义检查
echo "自定义检查:"
# 你的检查命令
```

---

## 注意事项

1. **实时监控脚本会持续运行**，记得按 `Ctrl+C` 退出
2. **监控间隔固定为 5 秒**，可以修改脚本中的 `sleep 5` 来调整
3. **快捷命令需要重新登录**才能生效
4. **建议使用 screen 或 tmux** 在后台运行监控脚本
5. **监控脚本不会修改任何系统配置**，只读取信息

---

## 进阶使用

### 在 screen 中运行监控
```bash
# 创建 screen 会话
screen -S monitor

# 运行监控
monitor-enhanced

# 分离会话: Ctrl+A, D
# 恢复会话: screen -r monitor
```

### 定时生成报告
```bash
# 自动设置（推荐）
sudo bash /www/wwwroot/rehab-care-link/scripts/setup-cron.sh

# 或手动添加到 crontab
crontab -e

# 每5分钟保存监控快照
*/5 * * * * bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -s >> /var/log/rehab-care-link/cron.log 2>&1

# 每6小时生成完整报告
0 */6 * * * bash /www/wwwroot/rehab-care-link/scripts/monitor-once.sh > /var/log/rehab-care-link/report-$(date +\%Y\%m\%d-\%H\%M).log 2>&1
```

### 查看监控历史
```bash
# 查看最近记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -l 20

# 实时查看
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -t

# 查看今天的记录
bash /www/wwwroot/rehab-care-link/scripts/monitor-history.sh -d $(date +%Y-%m-%d)
```

---

## 相关资源

- [PM2 文档](https://pm2.keymetrics.io/)
- [Linux 性能监控](https://www.brendangregg.com/linuxperf.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**最后更新:** 2026-01-24
