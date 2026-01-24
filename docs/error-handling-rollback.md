# 错误处理和回滚系统文档

本系统提供了全面的错误处理、健康监控和自动回滚功能。

## 组件概览

### 1. 健康检查系统 (`.github/workflows/health-check.yml`)

**功能:**
- 每5分钟自动检查服务健康状态
- 监控API、数据库、前端和PM2进程
- 检测到故障时自动触发回滚

**检查项目:**
- API健康端点 (`/api/health`)
- 数据库连接状态
- 前端页面可访问性
- PM2进程运行状态

**触发方式:**
- 自动: 每5分钟通过cron触发
- 手动: 在GitHub Actions界面手动运行

### 2. 自动回滚系统 (`.github/workflows/auto-rollback.yml`)

**功能:**
- 在检测到故障时自动回滚到上一个稳定版本
- 备份当前状态（应用代码和数据库）
- 验证回滚后的服务状态

**执行流程:**
1. 备份当前部署状态
2. 备份数据库
3. 停止当前服务
4. 部署上一个稳定版本
5. 启动服务并验证
6. 记录回滚信息

**触发方式:**
- 自动: 由健康检查失败触发
- 手动: 在GitHub Actions界面指定回滚参数

**手动触发示例:**
```bash
# 在GitHub Actions界面，选择 "Auto Rollback" workflow
# 填写以下参数:
# - reason: "健康检查失败" 或其他原因
# - failed_commit: 失败的提交哈希（可选）
# - last_success_commit: 回滚目标提交（可选，默认为HEAD^）
# - skip_backup: false（是否跳过备份）
```

### 3. 数据库备份脚本 (`scripts/backup-db.sh`)

**功能:**
- 定期备份SQLite数据库
- 验证备份完整性
- 自动清理旧备份
- 支持压缩备份

**使用方法:**

```bash
# 基本用法
./scripts/backup-db.sh

# 执行压缩备份
./scripts/backup-db.sh -c

# 指定保留50个备份
./scripts/backup-db.sh -m 50

# 验证现有备份
./scripts/backup-db.sh -v

# 指定自定义路径
./scripts/backup-db.sh -d /path/to/db.db -b /backup/dir

# 显示帮助
./scripts/backup-db.sh -h
```

**配置选项:**

通过环境变量配置:
```bash
export DB_PATH="/www/wwwroot/rehab-care-link/server/data/rehab.db"
export BACKUP_DIR="/www/backup/rehab-care-link/db"
export MAX_BACKUPS=30
export COMPRESS_BACKUP=true
```

**设置定时任务:**

```bash
# 编辑crontab
crontab -e

# 添加每天凌晨2点执行备份
0 2 * * * /www/wwwroot/rehab-care-link/scripts/backup-db.sh >> /www/backup/rehab-care-link/cron.log 2>&1
```

参考 `scripts/cron-examples.conf` 查看更多定时任务示例。

### 4. 全局错误处理中间件 (`server/index.js`)

**功能:**
- 捕获所有未处理的错误
- 记录详细的错误日志
- 根据错误类型返回适当的HTTP状态码
- 生成唯一的错误ID用于追踪

**错误类型处理:**

| 错误类型 | HTTP状态码 | 说明 |
|---------|-----------|------|
| ValidationError | 400 | 验证失败 |
| UnauthorizedError | 401 | 未授权 |
| NotFoundError | 404 | 资源未找到 |
| ECONNREFUSED | 503 | 数据库连接失败 |
| MulterError | 400/413 | 文件上传错误 |
| 其他错误 | 500 | 服务器内部错误 |

**错误响应格式:**

```json
{
  "success": false,
  "error": "错误类型",
  "details": "详细错误信息",
  "errorId": "唯一错误ID",
  "stack": "堆栈跟踪（仅开发环境）"
}
```

**优雅关闭处理:**

服务器现在支持优雅关闭，在收到 SIGTERM 或 SIGINT 信号时:
1. 停止接受新连接
2. 等待现有请求完成（最多30秒）
3. 关闭数据库连接
4. 退出进程

## 配置要求

### GitHub Secrets

确保在GitHub仓库设置中配置以下Secrets:

```
DOMAIN          # 域名，如 rehab.example.com
HOST            # 服务器IP地址
USERNAME        # SSH用户名
SSH_PRIVATE_KEY # SSH私钥
```

### 服务器要求

1. **PM2** - 进程管理
```bash
npm install -g pm2
```

2. **SQLite3** - 数据库工具（可选，用于完整性检查）
```bash
apt-get install sqlite3
```

3. **备份目录** - 确保有足够的磁盘空间
```bash
mkdir -p /www/backup/rehab-care-link/db
chmod 755 /www/backup/rehab-care-link
```

## 监控和维护

### 查看健康检查日志

在GitHub Actions界面查看 "Health Check" workflow的运行历史。

### 查看回滚历史

在服务器上查看回滚日志:
```bash
cat /www/wwwroot/rehab-care-link/rollback-log.txt
```

### 查看备份日志

```bash
cat /www/backup/rehab-care-link/db/backup.log
```

### 列出所有备份

```bash
ls -lh /www/backup/rehab-care-link/db/rehab_*.db*
```

### 手动恢复备份

```bash
# 停止服务
pm2 stop rehab-server

# 恢复备份
cp /www/backup/rehab-care-link/db/rehab_20260124_020000.db \
   /www/wwwroot/rehab-care-link/server/data/rehab.db

# 重启服务
pm2 restart rehab-server
```

## 故障排查

### 健康检查失败

1. 检查服务器日志:
```bash
pm2 logs rehab-server --lines 100
```

2. 手动测试健康端点:
```bash
curl https://your-domain.com/api/health
```

3. 检查PM2进程:
```bash
pm2 list
pm2 describe rehab-server
```

### 自动回滚失败

1. 查看GitHub Actions日志
2. 检查服务器磁盘空间:
```bash
df -h
```

3. 手动执行回滚步骤
4. 检查备份完整性

### 备份失败

1. 查看备份日志:
```bash
tail -n 50 /www/backup/rehab-care-link/db/backup.log
```

2. 检查磁盘空间
3. 验证数据库文件权限:
```bash
ls -l /www/wwwroot/rehab-care-link/server/data/rehab.db
```

4. 手动运行备份脚本并查看输出:
```bash
/www/wwwroot/rehab-care-link/scripts/backup-db.sh
```

## 最佳实践

1. **定期测试回滚** - 每月手动触发一次回滚测试
2. **监控磁盘空间** - 确保备份目录有足够空间
3. **验证备份** - 定期运行备份验证
4. **查看日志** - 定期检查健康检查和备份日志
5. **更新文档** - 记录任何系统变更

## 扩展建议

1. **集成监控工具** - 如 Prometheus、Grafana
2. **添加告警通知** - 邮件、Slack、钉钉等
3. **远程备份** - 将备份同步到云存储
4. **数据库迁移** - 考虑升级到PostgreSQL或MySQL
5. **容器化部署** - 使用Docker简化回滚流程

## 联系支持

如遇问题，请查看:
- GitHub Issues
- 项目文档
- 服务器日志文件
