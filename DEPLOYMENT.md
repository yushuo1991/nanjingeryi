# 部署说明（Nginx + Node）

本项目由两部分组成：
- 前端：Vite 构建的静态站点（输出 `dist/`）
- 后端：`server/` 内的 Node 服务（提供 `/api/*`）

## 1) 服务器准备

- 安装 Node.js（建议 18+）
- 安装 Nginx

## 2) 部署后端（数据存储）

后端会把数据写入 `server/data/db.json`（JSON 持久化），请确保该目录可写。

1. 上传项目到服务器（例如 `/opt/children-hospital/`）
2. 安装依赖并启动：

```bash
cd /opt/children-hospital/server
npm install --production
cp .env.example .env
vim .env
node index.js
```

3. 环境变量（`.env`）：
- `PORT=3001`（默认端口）
- 其他可选配置见 `.env.example`


## 3) 部署前端（静态文件）

在构建机/服务器上构建：

```bash
cd /opt/children-hospital
npm install
npm run build
```

构建产物在 `dist/`。

## 4) Nginx 反向代理（推荐同域）

推荐用同域反代，避免 HTTPS 混合内容问题：前端访问 `https://your-domain/`，API 走 `https://your-domain/api/*`。

示例（`/etc/nginx/conf.d/children-hospital.conf`）：

```nginx
server {
  listen 80;
  server_name your-domain.com;

  # 静态站点
  root /opt/children-hospital/dist;
  index index.html;

  # SPA 路由
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 反代 API 到 Node（本机 3001）
  location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### HTTPS（80/443）
如果你使用 BT 面板，常见证书路径为：
- `/www/server/panel/vhost/cert/<domain>/fullchain.pem`
- `/www/server/panel/vhost/cert/<domain>/privkey.pem`

本项目的 `deploy/deploy.ps1` 会在发现证书存在时自动生成 `80 -> 443` 跳转，并启用 `443 ssl`；如果未检测到证书，则仅部署 `80`，后续配置证书后可再次部署。

### 上线检查
首次部署后，请确认 `https://<domain>/api/health` 返回 JSON：`{"status":"ok"}`。
如果 `/api/*` 返回 `index.html`，表示 Nginx 未正确反代 `/api/` 到 Node 后端（前端会提示“API 返回了 HTML”）。

## 5) systemd 守护（可选）

示例（`/etc/systemd/system/children-hospital.service`）：

```ini
[Unit]
Description=Children Hospital Server
After=network.target

[Service]
WorkingDirectory=/opt/children-hospital/server
Environment=NODE_ENV=production
EnvironmentFile=/opt/children-hospital/server/.env
ExecStart=/usr/bin/node /opt/children-hospital/server/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

启用与启动：

```bash
systemctl daemon-reload
systemctl enable --now children-hospital
systemctl status children-hospital
```
