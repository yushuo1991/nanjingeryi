# DNS 访问问题修复指南

## 问题诊断
您的本地 DNS 服务器 (198.18.0.2) 无法正确解析 ey.yushuo.click 域名，导致外网访问不稳定。

## 解决方案

### 方案1：修改 Windows DNS 设置（推荐）

1. 打开"控制面板" → "网络和 Internet" → "网络和共享中心"
2. 点击您当前使用的网络连接
3. 点击"属性"
4. 选择"Internet 协议版本 4 (TCP/IPv4)"，点击"属性"
5. 选择"使用下面的 DNS 服务器地址"
6. 设置为：
   - **首选 DNS 服务器**: `8.8.8.8` (Google DNS)
   - **备用 DNS 服务器**: `1.1.1.1` (Cloudflare DNS)
7. 点击"确定"保存

### 方案2：刷新 DNS 缓存

打开命令提示符（管理员权限），运行：
```bash
ipconfig /flushdns
```

### 方案3：临时使用 IP 访问

如果急需访问，可以修改 hosts 文件：
1. 以管理员身份打开记事本
2. 打开文件：`C:\Windows\System32\drivers\etc\hosts`
3. 添加一行：
   ```
   107.173.154.147 ey.yushuo.click
   ```
4. 保存文件

## 验证修复

修改后，在命令提示符中运行：
```bash
nslookup ey.yushuo.click
ping ey.yushuo.click
```

如果看到正确的 IP 地址 (107.173.154.147)，说明问题已解决。

## 服务器状态
✅ 服务器运行正常
✅ 网站可以正常访问
✅ API 服务正常
✅ 数据库连接正常

问题完全出在本地 DNS 解析，不是服务器问题。
