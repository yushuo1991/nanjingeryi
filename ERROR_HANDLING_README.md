# 错误处理和回滚系统

完整的生产级错误处理、健康监控和自动回滚系统。

## 系统组件

### 1. 健康检查工作流
**文件:** `.github/workflows/health-check.yml`

自动化健康监控系统，每5分钟检查一次服务状态。

**监控项目:**
- ✅ API健康端点
- ✅ 数据库连接
- ✅ 前端可访问性
- ✅ PM2进程状态

**特性:**
- 自动触发回滚（检测到故障时）
- 详细的健康状态日志
- 失败通知和告警

### 2. 自动回滚工作流
**文件:** `.github/workflows/auto-rollback.yml`

智能回滚系统，在检测到故障时自动恢复到稳定版本。

**工作流程:**
1. 备份当前状态（代码 + 数据库）
2. 停止故障服务
3. 部署上一个稳定版本
4. 验证回滚成功
5. 记录回滚历史

**特性:**
- 完整的状态备份
- 回滚验证机制
- 失败自动恢复
- 详细的回滚日志

### 3. 数据库备份脚本
**文件:** `scripts/backup-db.sh`

生产级数据库备份工具，支持自动化和手动执行。

**功能:**
- ✅ SQLite数据库备份
- ✅ 完整性验证
- ✅ 自动清理旧备份
- ✅ 压缩支持
- ✅ 详细日志记录

**使用示例:**
```bash
# 基本备份
./scripts/backup-db.sh

# 压缩备份
./scripts/backup-db.sh -c

# 验证备份
./scripts/backup-db.sh -v

# 保留50个备份
./scripts/backup-db.sh -m 50
```

### 4. 全局错误处理
**文件:** `server/index.js`

增强的Express错误处理中间件。

**功能:**
- ✅ 统一错误响应格式
- ✅ 详细错误日志
- ✅ 错误ID追踪
- ✅ 优雅关闭处理
- ✅ 未捕获异常处理

**错误类型:**
| 类型 | 状态码 | 说明 |
|------|--------|------|
| ValidationError | 400 | 验证失败 |
| UnauthorizedError | 401 | 未授权 |
| NotFoundError | 404 | 资源未找到 |
| MulterError | 413 | 文件过大 |
| ECONNREFUSED | 503 | 服务不可用 |
| 默认 | 500 | 服务器错误 |

## 快速开始

### 1. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets:

```
DOMAIN          # 域名（如 rehab.example.com）
HOST            # 服务器IP
USERNAME        # SSH用户名
SSH_PRIVATE_KEY # SSH私钥
```

### 2. 设置定时备份

在服务器上添加crontab任务:

```bash
# 编辑crontab
crontab -e

# 添加每天凌晨2点执行备份
0 2 * * * /www/wwwroot/rehab-care-link/scripts/backup-db.sh >> /www/backup/rehab-care-link/cron.log 2>&1
```

更多定时任务示例见 `scripts/cron-examples.conf`

### 3. 启用健康检查

健康检查工作流会自动运行（每5分钟），无需手动启用。

查看状态: GitHub Actions → Health Check workflow

### 4. 测试系统

运行测试脚本验证所有功能:

```bash
# 给脚本执行权限
chmod +x scripts/test-error-handling.sh

# 运行测试
./scripts/test-error-handling.sh
```

## 使用指南

### 查看健康状态

```bash
# 在浏览器或命令行
curl https://your-domain.com/api/health

# 预期响应
{
  "status": "ok",
  "db": "ok"
}
```

### 手动触发回滚

1. 进入GitHub仓库
2. 点击 Actions → Auto Rollback
3. 点击 "Run workflow"
4. 填写回滚原因和目标提交
5. 点击 "Run workflow" 执行

### 恢复数据库备份

```bash
# 1. 停止服务
pm2 stop rehab-server

# 2. 恢复备份
cp /www/backup/rehab-care-link/db/rehab_20260124_020000.db \
   /www/wwwroot/rehab-care-link/server/data/rehab.db

# 3. 重启服务
pm2 restart rehab-server

# 4. 验证
curl http://localhost:3201/api/health
```

### 查看日志

```bash
# PM2日志
pm2 logs rehab-server

# 备份日志
cat /www/backup/rehab-care-link/db/backup.log

# 回滚日志
cat /www/wwwroot/rehab-care-link/rollback-log.txt

# GitHub Actions日志
# 在GitHub界面查看对应workflow的运行记录
```

## 文件结构

```
rehab-care-link/
├── .github/
│   └── workflows/
│       ├── health-check.yml      # 健康检查工作流
│       └── auto-rollback.yml     # 自动回滚工作流
├── scripts/
│   ├── backup-db.sh              # 数据库备份脚本
│   ├── test-error-handling.sh    # 测试脚本
│   └── cron-examples.conf        # Cron配置示例
├── server/
│   └── index.js                  # 增强的错误处理
└── docs/
    ├── error-handling-rollback.md # 完整文档
    └── quick-reference.md         # 快速参考
```

## 故障排查

### 健康检查失败

**检查清单:**
- [ ] 服务器在线: `ping your-domain.com`
- [ ] PM2进程运行: `pm2 list`
- [ ] 端口监听: `netstat -tlnp | grep 3201`
- [ ] 数据库文件存在: `ls -l server/data/rehab.db`
- [ ] 环境变量配置: `cat .env`

**快速修复:**
```bash
pm2 restart rehab-server
pm2 logs rehab-server --lines 50
```

### 备份失败

**检查清单:**
- [ ] 磁盘空间: `df -h`
- [ ] 文件权限: `ls -l server/data/rehab.db`
- [ ] 备份目录存在: `ls -ld /www/backup/rehab-care-link`
- [ ] 脚本权限: `ls -l scripts/backup-db.sh`

**快速修复:**
```bash
# 创建备份目录
mkdir -p /www/backup/rehab-care-link/db

# 修复权限
chmod +x scripts/backup-db.sh
chmod 644 server/data/rehab.db

# 手动备份
./scripts/backup-db.sh
```

### 回滚失败

**检查清单:**
- [ ] GitHub Secrets配置正确
- [ ] SSH连接正常: `ssh user@host`
- [ ] 磁盘空间充足: `df -h`
- [ ] 备份文件存在

**手动回滚:**
参考 `docs/quick-reference.md` 中的手动回滚步骤

## 最佳实践

### 监控
- ✅ 每天检查GitHub Actions健康检查状态
- ✅ 定期查看PM2日志
- ✅ 监控磁盘空间使用

### 备份
- ✅ 保持至少30天的备份
- ✅ 每月验证一次备份完整性
- ✅ 重要更新前手动备份

### 测试
- ✅ 每月测试一次回滚流程
- ✅ 部署后运行测试脚本
- ✅ 定期进行灾难恢复演练

### 维护
- ✅ 定期清理旧日志
- ✅ 更新文档记录变更
- ✅ 审查错误日志模式

## 高级配置

### 自定义健康检查间隔

编辑 `.github/workflows/health-check.yml`:

```yaml
schedule:
  - cron: '*/10 * * * *'  # 改为每10分钟
```

### 增加备份保留数量

编辑 `scripts/backup-db.sh` 或使用环境变量:

```bash
export MAX_BACKUPS=60
./scripts/backup-db.sh
```

### 启用备份压缩

```bash
export COMPRESS_BACKUP=true
./scripts/backup-db.sh -c
```

### 配置告警通知

可以在工作流中添加通知步骤，支持:
- 邮件通知
- Slack通知
- 钉钉通知
- 企业微信通知

示例见 `.github/workflows/health-check.yml` 的通知步骤。

## 文档

- **完整文档:** `docs/error-handling-rollback.md`
- **快速参考:** `docs/quick-reference.md`
- **Cron示例:** `scripts/cron-examples.conf`
- **测试脚本:** `scripts/test-error-handling.sh`

## 技术栈

- **CI/CD:** GitHub Actions
- **进程管理:** PM2
- **数据库:** SQLite3
- **备份工具:** Bash + sqlite3
- **错误处理:** Express中间件
- **部署:** SSH + SCP

## 支持的平台

- ✅ Ubuntu 18.04+
- ✅ Debian 10+
- ✅ CentOS 7+
- ✅ 其他Linux发行版（需要bash、curl、sqlite3）

## 许可证

本系统作为项目的一部分，遵循项目主许可证。

## 贡献

欢迎提交问题和改进建议。

## 更新日志

### v1.0.0 (2026-01-24)
- ✅ 初始发布
- ✅ 健康检查系统
- ✅ 自动回滚系统
- ✅ 数据库备份脚本
- ✅ 全局错误处理
- ✅ 完整文档和测试
