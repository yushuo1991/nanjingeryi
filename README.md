# 儿童医院管理系统

## 本地开发

### 1) 启动后端

```bash
cd server
npm install
cp .env.example .env
node index.js
```

后端默认端口：`http://localhost:3001`

### 2) 启动前端（Vite）

```bash
npm install
npm run dev
```

前端默认端口：`http://localhost:3000`

`vite.config.js` 已配置将 `/api/*` 代理到 `http://localhost:3001`。

## 部署

参考 `DEPLOYMENT.md`。

