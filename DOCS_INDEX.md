# 📚 错误处理和回滚系统 - 文档索引

## 快速导航

### 🚀 新手入门
1. **[系统概览](ERROR_HANDLING_README.md)** - 从这里开始
2. **[快速参考](docs/quick-reference.md)** - 常用命令速查
3. **[设置脚本](scripts/setup-system.sh)** - 一键初始化系统

### 📖 详细文档
1. **[完整文档](docs/error-handling-rollback.md)** - 深入了解系统
2. **[实施总结](IMPLEMENTATION_SUMMARY.md)** - 实施细节和清单
3. **[验证报告](VERIFICATION_REPORT.md)** - 完整验证清单
4. **[架构图](ARCHITECTURE_DIAGRAM.md)** - 系统架构可视化

### 🔧 配置和使用
1. **[Cron示例](scripts/cron-examples.conf)** - 定时任务配置
2. **[备份脚本](scripts/backup-db.sh)** - 数据库备份工具
3. **[测试脚本](scripts/test-error-handling.sh)** - 系统测试工具

### ⚙️ GitHub Workflows
1. **[健康检查](.github/workflows/health-check.yml)** - 自动监控
2. **[自动回滚](.github/workflows/auto-rollback.yml)** - 故障恢复

---

## 按使用场景查找

### 场景1: 初次设置系统
1. 阅读 [系统概览](ERROR_HANDLING_README.md#快速开始)
2. 运行 [设置脚本](scripts/setup-system.sh)
3. 配置 GitHub Secrets
4. 运行 [测试脚本](scripts/test-error-handling.sh)

### 场景2: 配置定时备份
1. 查看 [Cron示例](scripts/cron-examples.conf)
2. 运行 `crontab -e` 添加任务
3. 测试备份: `./scripts/backup-db.sh`

### 场景3: 故障排查
1. 查看 [快速参考 - 常见问题](docs/quick-reference.md#常见问题)
2. 检查 PM2日志: `pm2 logs rehab-server`
3. 运行健康检查: `curl localhost:3201/api/health`

### 场景4: 手动回滚
1. 查看 [快速参考 - 手动回滚](docs/quick-reference.md#手动回滚)
2. 备份当前状态
3. 恢复目标版本
4. 验证服务

### 场景5: 数据库恢复
1. 查看 [快速参考 - 恢复备份](docs/quick-reference.md#恢复数据库备份)
2. 停止服务
3. 复制备份文件
4. 重启并验证

---

## 按角色查找

### 开发人员
- [系统概览](ERROR_HANDLING_README.md)
- [完整文档](docs/error-handling-rollback.md)
- [架构图](ARCHITECTURE_DIAGRAM.md)
- [测试脚本](scripts/test-error-handling.sh)

### 运维人员
- [快速参考](docs/quick-reference.md)
- [备份脚本](scripts/backup-db.sh)
- [Cron配置](scripts/cron-examples.conf)
- [设置脚本](scripts/setup-system.sh)

### 项目经理
- [实施总结](IMPLEMENTATION_SUMMARY.md)
- [验证报告](VERIFICATION_REPORT.md)
- [系统概览](ERROR_HANDLING_README.md)

---

## 文件清单

### 核心文件
```
.github/workflows/
├── health-check.yml          # 健康检查workflow
└── auto-rollback.yml         # 自动回滚workflow

scripts/
├── backup-db.sh              # 数据库备份脚本 ⭐
├── test-error-handling.sh    # 系统测试脚本 ⭐
├── setup-system.sh           # 系统设置脚本 ⭐
└── cron-examples.conf        # Cron配置示例

server/
└── index.js                  # 增强的错误处理 (已修改)
```

### 文档文件
```
docs/
├── error-handling-rollback.md  # 完整系统文档
└── quick-reference.md          # 快速参考手册

根目录/
├── ERROR_HANDLING_README.md    # 系统概览和快速开始
├── IMPLEMENTATION_SUMMARY.md   # 实施总结
├── VERIFICATION_REPORT.md      # 验证报告
├── ARCHITECTURE_DIAGRAM.md     # 架构图
└── DOCS_INDEX.md              # 本文档 (索引)
```

---

## 快速命令参考

### 系统管理
```bash
# 初始化系统
./scripts/setup-system.sh

# 运行测试
./scripts/test-error-handling.sh

# 执行备份
./scripts/backup-db.sh

# 查看帮助
./scripts/backup-db.sh --help
```

### 服务管理
```bash
# PM2管理
pm2 list
pm2 logs rehab-server
pm2 restart rehab-server

# 健康检查
curl http://localhost:3201/api/health
```

### 日志查看
```bash
# 应用日志
pm2 logs rehab-server --lines 100

# 备份日志
cat /www/backup/rehab-care-link/db/backup.log

# 回滚日志
cat /www/wwwroot/rehab-care-link/rollback-log.txt
```

---

## 功能特性速查

| 功能 | 文件 | 说明 |
|------|------|------|
| 健康监控 | `.github/workflows/health-check.yml` | 每5分钟自动检查 |
| 自动回滚 | `.github/workflows/auto-rollback.yml` | 故障自动恢复 |
| 数据库备份 | `scripts/backup-db.sh` | 支持定时备份 |
| 系统测试 | `scripts/test-error-handling.sh` | 全面测试套件 |
| 错误处理 | `server/index.js` | 全局中间件 |
| 优雅关闭 | `server/index.js` | 信号处理 |

---

## 技术栈

- **CI/CD:** GitHub Actions
- **进程管理:** PM2
- **数据库:** SQLite3
- **备份:** Bash + cron
- **服务端:** Node.js + Express
- **测试:** Bash + curl

---

## 支持的操作系统

- ✅ Ubuntu 18.04+
- ✅ Debian 10+
- ✅ CentOS 7+
- ✅ 其他Linux (需bash 4.0+)

---

## 获取帮助

### 问题诊断流程
1. 查看 [快速参考 - 常见问题](docs/quick-reference.md#常见问题)
2. 检查 [完整文档 - 故障排查](docs/error-handling-rollback.md#故障排查)
3. 运行 [测试脚本](scripts/test-error-handling.sh)
4. 查看应用日志: `pm2 logs`

### 紧急联系
- 查看服务器日志
- 检查GitHub Actions状态
- 参考备份恢复流程

---

## 更新日志

### v1.0.0 (2026-01-24)
- ✅ 初始发布
- ✅ 完整的错误处理系统
- ✅ 自动回滚功能
- ✅ 数据库备份系统
- ✅ 全面的文档和测试

---

## 许可证

本系统作为项目的一部分，遵循项目主许可证。

---

**最后更新:** 2026-01-24
**版本:** 1.0.0
**维护者:** 开发团队
