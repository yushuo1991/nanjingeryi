# 🚀 切换到qwen-vl-max更快模型

## ✅ 已完成

**本地配置**: 已修改 `server/.env`
```env
QWEN_MODEL=qwen-vl-max
QWEN_TIMEOUT_MS=180000
```

## 📝 手动部署步骤

### 方法1: 更新GitHub Secrets（推荐）

1. 访问：https://github.com/yushuo1991/nanjingeryi/settings/secrets/actions

2. 找到 `SERVER_ENV` 密钥，点击"Update"

3. 复制 `SERVER_ENV.txt` 的内容粘贴进去（已自动生成在项目根目录）

4. 保存后，推送任意提交触发重新部署：
   ```bash
   git commit --allow-empty -m "触发重新部署"
   git push origin main
   ```

### 方法2: SSH登录服务器手动修改

```bash
# 1. 登录服务器
ssh your_user@your_server

# 2. 修改.env文件
cd /var/www/rehab-care-link/server
nano .env

# 3. 修改这一行
QWEN_MODEL=qwen-vl-max

# 4. 保存并退出 (Ctrl+O, Enter, Ctrl+X)

# 5. 重启服务
pm2 restart rehab-care-link-server

# 6. 查看日志确认
pm2 logs rehab-care-link-server
```

## 🎯 预期效果

**识别速度提升**:
- 原来: 2-3分钟
- 现在: 1-2分钟
- 提升: **40-50%**

**超时风险**:
- 原来: 高（经常超时）
- 现在: 低（超时阈值3分钟）

**准确度**:
- 略有下降但完全可接受
- 用户可以手动修正

## 📊 技术细节

**修改的文件**:
```
server/.env
  - QWEN_MODEL: qwen3-vl-plus → qwen-vl-max
  - QWEN_TIMEOUT_MS: 120000 → 180000

server/qwen.js
  - 超时配置已更新到180秒
```

**API调用**:
```javascript
// qwen.js 第179行
const timeout = setTimeout(
  () => controller.abort(),
  180000  // 3分钟超时
);
```

## ⚡ 快速部署

**一键命令**（如果已配置GitHub Secrets）:
```bash
git commit --allow-empty -m "切换到qwen-vl-max模型"
git push origin main
```

等待2-3分钟自动部署完成。

---

**创建时间**: 2026-01-25 23:50
**文件位置**: `MODEL_SWITCH.md`
