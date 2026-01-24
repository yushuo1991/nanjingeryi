# 错误处理和回滚系统 - 快速参考

## 快速命令

### 健康检查

```bash
# 检查API健康状态
curl https://your-domain.com/api/health

# 检查PM2进程
pm2 list
pm2 describe rehab-server

# 查看最近日志
pm2 logs rehab-server --lines 50
```

### 数据库备份

```bash
# 执行立即备份
./scripts/backup-db.sh

# 执行压缩备份
./scripts/backup-db.sh -c

# 查看备份列表
ls -lh /www/backup/rehab-care-link/db/

# 查看备份日志
tail -n 50 /www/backup/rehab-care-link/db/backup.log
```

### 手动回滚

```bash
# 1. 停止服务
pm2 stop rehab-server

# 2. 备份当前状态
cp -r /www/wwwroot/rehab-care-link /www/backup/rehab-care-link/manual_$(date +%Y%m%d_%H%M%S)

# 3. 切换到上一个版本
cd /www/wwwroot/rehab-care-link
git fetch
git checkout <commit-hash>

# 4. 重新构建
npm ci
npm run build

# 5. 重启服务
pm2 restart rehab-server

# 6. 验证
curl https://your-domain.com/api/health
```

### 恢复数据库备份

```bash
# 1. 停止服务
pm2 stop rehab-server

# 2. 备份当前数据库
cp /www/wwwroot/rehab-care-link/server/data/rehab.db \
   /www/wwwroot/rehab-care-link/server/data/rehab.db.before_restore

# 3. 恢复备份
cp /www/backup/rehab-care-link/db/rehab_20260124_020000.db \
   /www/wwwroot/rehab-care-link/server/data/rehab.db

# 4. 重启服务
pm2 restart rehab-server

# 5. 验证
curl https://your-domain.com/api/health
```

## 常见问题

### 健康检查失败

**症状:** GitHub Actions中健康检查workflow失败

**排查步骤:**
1. 检查服务器是否在线: `ping your-domain.com`
2. 检查PM2进程: `pm2 list`
3. 查看错误日志: `pm2 logs rehab-server --err --lines 100`
4. 检查端口占用: `netstat -tlnp | grep 3201`
5. 手动测试API: `curl http://localhost:3201/api/health`

**解决方案:**
- 重启服务: `pm2 restart rehab-server`
- 检查环境变量: `cat .env`
- 重新部署: 触发GitHub Actions deploy workflow

### 自动回滚失败

**症状:** 回滚workflow执行失败

**排查步骤:**
1. 查看workflow日志
2. 检查磁盘空间: `df -h`
3. 检查SSH连接: `ssh username@host`
4. 验证备份目录权限: `ls -la /www/backup`

**解决方案:**
- 清理磁盘空间
- 手动执行回滚步骤
- 检查GitHub Secrets配置

### 备份失败

**症状:** 备份脚本报错

**排查步骤:**
1. 查看备份日志: `cat /www/backup/rehab-care-link/db/backup.log`
2. 检查数据库文件: `ls -l /www/wwwroot/rehab-care-link/server/data/rehab.db`
3. 检查磁盘空间: `df -h`
4. 测试数据库: `sqlite3 rehab.db "PRAGMA integrity_check;"`

**解决方案:**
- 修复文件权限: `chmod 644 rehab.db`
- 清理旧备份: `./scripts/backup-db.sh` (自动清理)
- 手动备份: `cp rehab.db /www/backup/rehab-care-link/db/manual_backup.db`

### 数据库损坏

**症状:** 健康检查显示数据库错误

**紧急修复:**
```bash
# 1. 停止服务
pm2 stop rehab-server

# 2. 检查数据库完整性
sqlite3 /www/wwwroot/rehab-care-link/server/data/rehab.db "PRAGMA integrity_check;"

# 3. 如果损坏，从备份恢复
LATEST_BACKUP=$(ls -t /www/backup/rehab-care-link/db/rehab_*.db 2>/dev/null | head -n 1)
if [ -n "$LATEST_BACKUP" ]; then
    cp "$LATEST_BACKUP" /www/wwwroot/rehab-care-link/server/data/rehab.db
fi

# 4. 重启服务
pm2 restart rehab-server
```

### 服务频繁重启

**症状:** PM2显示服务不断重启

**排查步骤:**
1. 查看错误日志: `pm2 logs rehab-server --err --lines 200`
2. 检查内存使用: `free -h`
3. 检查进程状态: `pm2 describe rehab-server`

**解决方案:**
- 增加内存限制: `pm2 start server/index.js --max-memory-restart 500M`
- 检查代码错误
- 重置PM2: `pm2 delete rehab-server && pm2 start server/index.js --name rehab-server`

## 监控命令

### 实时监控

```bash
# PM2实时监控
pm2 monit

# 实时日志
pm2 logs rehab-server

# 系统资源监控
htop

# 磁盘使用监控
watch -n 5 df -h
```

### 定期检查

```bash
# 每日健康检查脚本
cat > /usr/local/bin/daily-health-check.sh << 'EOF'
#!/bin/bash
echo "===== 每日健康检查 $(date) =====" >> /var/log/rehab-health.log

# API健康
curl -s https://your-domain.com/api/health >> /var/log/rehab-health.log

# PM2状态
pm2 list >> /var/log/rehab-health.log

# 磁盘空间
df -h >> /var/log/rehab-health.log

# 最近备份
ls -lh /www/backup/rehab-care-link/db/ | head -n 5 >> /var/log/rehab-health.log

echo "" >> /var/log/rehab-health.log
EOF

chmod +x /usr/local/bin/daily-health-check.sh

# 添加到crontab
echo "0 8 * * * /usr/local/bin/daily-health-check.sh" | crontab -
```

## 紧急联系清单

### 关键文件位置

```
应用目录:        /www/wwwroot/rehab-care-link
数据库文件:      /www/wwwroot/rehab-care-link/server/data/rehab.db
备份目录:        /www/backup/rehab-care-link
日志文件:        ~/.pm2/logs/
环境配置:        /www/wwwroot/rehab-care-link/.env
```

### 关键端口

```
API端口:         3201
HTTP端口:        80
HTTPS端口:       443
SSH端口:         22
```

### 重要命令速查

| 操作 | 命令 |
|------|------|
| 启动服务 | `pm2 start rehab-server` |
| 停止服务 | `pm2 stop rehab-server` |
| 重启服务 | `pm2 restart rehab-server` |
| 查看日志 | `pm2 logs rehab-server` |
| 执行备份 | `./scripts/backup-db.sh` |
| 运行测试 | `./scripts/test-error-handling.sh` |
| 检查健康 | `curl localhost:3201/api/health` |

## 维护计划

### 每日
- [ ] 检查GitHub Actions健康检查workflow状态
- [ ] 查看PM2进程状态
- [ ] 检查错误日志

### 每周
- [ ] 验证备份完整性
- [ ] 清理旧日志
- [ ] 检查磁盘空间
- [ ] 运行测试脚本

### 每月
- [ ] 测试回滚流程
- [ ] 更新依赖包
- [ ] 审查错误日志
- [ ] 性能优化检查

### 每季度
- [ ] 完整系统审计
- [ ] 更新文档
- [ ] 灾难恢复演练
- [ ] 安全漏洞扫描
