# 🚨 502错误修复指南

## 问题现象
```
/api/cases/96/extract: Failed to load resource: the server responded with a status of 502 (Bad Gateway)
AI识别失败: Error: fetch failed
```

## 根本原因
Nginx无法连接到后端Node.js API服务器（端口3201）

## 🔧 手动修复步骤

### 方法1: 通过GitHub Actions重新部署

1. 访问：https://github.com/yushuo1991/nanjingeryi/actions
2. 点击最新的workflow run
3. 查看日志中的PM2状态和健康检查结果
4. 如果失败，点击"Re-run all jobs"重新部署

### 方法2: SSH登录服务器手动修复

```bash
# 1. SSH登录服务器
ssh your_user@your_server

# 2. 检查PM2进程状态
pm2 status

# 3. 查看API日志
pm2 logs rehab-care-link-server --lines 50

# 4. 如果进程未运行，手动启动
cd /var/www/rehab-care-link/server
PORT=3201 pm2 start index.js --name rehab-care-link-server
pm2 save

# 5. 测试健康检查
curl http://127.0.0.1:3201/api/health

# 6. 如果还是失败，检查.env文件
cat /var/www/rehab-care-link/server/.env
# 确保包含：
# DASHSCOPE_API_KEY=sk-xxx
# DB_PATH=/var/www/rehab-care-link/server/database.db

# 7. 重新安装依赖
npm install --production

# 8. 重启服务
pm2 restart rehab-care-link-server
```

### 方法3: 检查DashScope API

```bash
# 测试API Key是否有效
curl -X POST "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation" \
  -H "Authorization: Bearer sk-0f4c025036b84ad681c2f14528b440d4" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-vl-plus",
    "input": {
      "messages": [{
        "role": "user",
        "content": [{"text": "test"}]
      }]
    }
  }'
```

## 🔍 常见问题排查

### 问题1: PM2进程不存在
**现象**: `pm2 status` 显示无进程
**解决**: 执行方法2的步骤4-5

### 问题2: API Key过期
**现象**: 日志显示 "Invalid API Key"
**解决**: 更新GitHub Secrets中的 `SERVER_ENV`，包含新的 `DASHSCOPE_API_KEY`

### 问题3: 数据库文件权限问题
**现象**: 日志显示 "SQLITE_CANTOPEN"
**解决**:
```bash
cd /var/www/rehab-care-link/server
chmod 666 database.db
chmod 777 .
```

### 问题4: 端口被占用
**现象**: 日志显示 "EADDRINUSE"
**解决**:
```bash
lsof -i :3201
kill -9 <PID>
pm2 restart rehab-care-link-server
```

## 📝 日志查看命令

```bash
# 实时查看所有日志
pm2 logs rehab-care-link-server

# 查看错误日志
tail -f /var/log/rehab-error.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 查看系统日志
journalctl -u pm2-root -f
```

## ✅ 验证修复成功

```bash
# 1. 检查PM2状态（应该显示online）
pm2 status

# 2. 测试健康检查（应该返回200）
curl -v http://127.0.0.1:3201/api/health

# 3. 从外部测试（应该返回200）
curl -v http://ey.yushuo.click/api/health

# 4. 测试完整流程
# 访问 http://ey.yushuo.click
# 点击AI智能建档
# 上传图片
# 应该成功识别
```

## 🚀 本次更新内容

**提交**:
- `01dfc46` - 紧急修复useRef导入
- `ec91c9b` - 优化部署脚本（待推送）

**改进**:
- ✅ 修复前端useRef错误
- ✅ 添加PM2日志路径配置
- ✅ 添加部署后健康检查
- ✅ 明确指定端口环境变量

## 📞 需要帮助？

如果以上方法都不能解决，请提供：
1. `pm2 logs rehab-care-link-server --lines 100` 的输出
2. `/var/log/rehab-error.log` 的内容
3. `curl http://127.0.0.1:3201/api/health` 的结果

---

**最后更新**: 2026-01-25 23:30
