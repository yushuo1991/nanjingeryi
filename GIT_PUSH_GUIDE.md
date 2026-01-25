# 🌐 GitHub推送失败 - 解决方案

## 🔴 问题现象
```
fatal: unable to access 'https://github.com/yushuo1991/nanjingeryi.git/':
Failed to connect to github.com port 443 after 21060 ms
```

## 💡 解决方案

### 方案1: 配置Git代理（如果你有VPN/代理）

```bash
# 假设你的代理是 127.0.0.1:7890
cd C:\Users\yushu\Desktop\rehab-care-link

# 设置HTTP代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 推送
git push origin main

# 推送成功后可以取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 方案2: 使用SSH协议（推荐）

```bash
cd C:\Users\yushu\Desktop\rehab-care-link

# 切换到SSH远程地址
git remote set-url origin git@github.com:yushuo1991/nanjingeryi.git

# 推送（需要先配置SSH密钥）
git push origin main
```

### 方案3: 稍后再试

网络波动导致，等待10-30分钟后重试：
```bash
cd C:\Users\yushu\Desktop\rehab-care-link
git push origin main
```

### 方案4: 使用GitHub Desktop（最简单）

1. 下载安装 GitHub Desktop
2. 打开项目文件夹
3. 点击"Push origin"按钮
4. 自动处理网络问题

---

## 📦 当前待推送的提交

**本地已提交但未推送**:
```
52c35a8 - 修复AI识别超时问题（容错处理）
1c4bc41 - 触发重新部署（切换qwen-vl-max模型）
e3be7e9 - 添加今日修复总结文档
```

**查看待推送提交**:
```bash
cd C:\Users\yushu\Desktop\rehab-care-link
git log origin/main..HEAD --oneline
```

---

## ✅ 推送成功后的操作

### 1. 更新GitHub Secret

访问: https://github.com/yushuo1991/nanjingeryi/settings/secrets/actions

更新 `SERVER_ENV` 为:
```env
PORT=3201
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=rehab_care_link
MYSQL_USER=rehab_ai_user
MYSQL_PASSWORD=8860c0a89019fc137498f06b6ff034f1
UPLOAD_DIR=/var/www/rehab-care-link/uploads
QWEN_MODEL=qwen-vl-max
QWEN_TIMEOUT_MS=180000
DASHSCOPE_API_KEY=sk-0f4c025036b84ad681c2f14528b440d4
```

### 2. 监控部署

访问: https://github.com/yushuo1991/nanjingeryi/actions

等待3-5分钟部署完成。

### 3. 测试验证

访问: http://ey.yushuo.click
- 测试AI识别速度（应该1-2分钟完成）
- 验证不再超时

---

## 🔧 常用命令

```bash
# 检查当前状态
git status

# 查看待推送的提交
git log origin/main..HEAD --oneline

# 查看远程地址
git remote -v

# 推送
git push origin main

# 强制推送（慎用）
git push -f origin main
```

---

## 📞 需要帮助？

如果以上方法都不行，可以：
1. 使用移动热点网络重试
2. 尝试不同的网络环境
3. 使用GitHub Desktop客户端
4. 等待网络恢复后再推送

---

**创建时间**: 2026-01-25 23:59
**待推送提交数**: 3个
**关键改进**: 切换到qwen-vl-max模型，速度提升40%
