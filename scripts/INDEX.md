# 脚本总览

本目录包含康复云查房助手的所有运维和监控脚本。

## 监控脚本

| 脚本名称 | 功能 | 使用场景 |
|---------|------|---------|
| `monitor.sh` | 基础实时监控 | 日常快速查看服务状态 |
| `monitor-enhanced.sh` | 增强版实时监控 | 详细的系统和服务监控 |
| `monitor-once.sh` | 一次性监控报告 | 生成诊断报告、CI/CD集成 |
| `monitor-history.sh` | 历史记录管理 | 追踪监控历史、分析趋势 |

## 工具脚本

| 脚本名称 | 功能 | 使用场景 |
|---------|------|---------|
| `setup-cron.sh` | 设置定时监控 | 自动化监控、定期报告 |
| `backup-db.sh` | 数据库备份 | 定期备份、灾难恢复 |

## 测试脚本

| 脚本名称 | 功能 | 使用场景 |
|---------|------|---------|
| `test-error-handling.sh` | 错误处理测试 | 测试服务器错误响应 |

## 配置文件

| 文件名称 | 功能 |
|---------|------|
| `cron-examples.conf` | Cron任务示例配置 |
| `README.md` | 详细使用文档 |
| `QUICKSTART.md` | 快速上手指南 |
| `INDEX.md` | 本文件 - 脚本总览 |

---

## 快速开始

1. **查看快速上手指南**: `QUICKSTART.md`
2. **阅读详细文档**: `README.md`
3. **部署脚本**: 使用 GitHub Actions "部署监控脚本" workflow

---

## 核心工作流

### 日常监控
```bash
# 实时监控
bash monitor-enhanced.sh

# 或使用快捷命令 (部署后)
monitor-enhanced
```

### 问题诊断
```bash
# 生成诊断报告
bash monitor-once.sh > /tmp/diagnosis.txt

# 查看错误历史
bash monitor-history.sh -e
```

### 自动化运维
```bash
# 设置定时任务
sudo bash setup-cron.sh

# 设置数据库备份
bash backup-db.sh setup
```

---

## 脚本依赖关系

```
monitor.sh
  └─ 需要: PM2, curl

monitor-enhanced.sh
  └─ 需要: PM2, curl, top, free, df, netstat

monitor-once.sh
  └─ 需要: PM2, curl, netstat

monitor-history.sh
  ├─ 依赖: monitor-once.sh (间接)
  └─ 需要: PM2, curl

setup-cron.sh
  └─ 依赖: monitor-history.sh, monitor-once.sh

backup-db.sh
  └─ 需要: sqlite3 (可选)
```

---

## GitHub Actions 工作流

| Workflow | 功能 | 触发方式 |
|----------|------|---------|
| `deploy-monitor.yml` | 部署监控脚本 | 手动触发 / scripts/monitor*.sh 变更 |
| `test-monitor.yml` | 测试监控脚本 | 手动触发 |

---

## 目录结构

```
scripts/
├── monitor.sh                  # 基础监控
├── monitor-enhanced.sh         # 增强监控
├── monitor-once.sh            # 一次性报告
├── monitor-history.sh         # 历史管理
├── setup-cron.sh              # 定时任务设置
├── backup-db.sh               # 数据库备份
├── test-error-handling.sh     # 错误测试
├── cron-examples.conf         # Cron示例
├── README.md                  # 详细文档
├── QUICKSTART.md              # 快速上手
└── INDEX.md                   # 本文件
```

---

## 日志位置

```
/var/log/rehab-care-link/
├── monitor-history.log        # 监控历史记录
├── cron.log                   # 定时任务日志
└── report-*.log               # 定期生成的报告
```

---

## 推荐工作流

### 初次部署
1. 运行 "部署监控脚本" GitHub Action
2. SSH 登录服务器
3. 运行 `sudo bash /www/wwwroot/rehab-care-link/scripts/setup-cron.sh`
4. 测试监控: `monitor-enhanced`

### 日常运维
1. 使用 `monitor-enhanced` 查看实时状态
2. 定期检查 `/var/log/rehab-care-link/` 下的报告
3. 出现问题时运行 `monitor-once.sh` 生成诊断报告

### 问题排查
1. 运行 `monitor-once.sh > /tmp/diagnosis.txt`
2. 查看错误历史: `monitor-history.sh -e`
3. 检查 PM2 日志: `pm2 logs rehab-care-link-server`

---

## 更新说明

- **2026-01-24**: 初始版本，包含完整的监控工具集
  - 3个实时监控脚本
  - 历史记录管理
  - 自动化定时任务
  - GitHub Actions 集成

---

## 相关链接

- [PM2 文档](https://pm2.keymetrics.io/)
- [Linux Cron 指南](https://man7.org/linux/man-pages/man5/crontab.5.html)
- [Bash 脚本编程](https://www.gnu.org/software/bash/manual/)

---

**维护者**: Claude Sonnet 4.5
**创建日期**: 2026-01-24
**最后更新**: 2026-01-24
