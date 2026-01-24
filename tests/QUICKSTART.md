# E2E 测试快速入门

## 快速开始 (3步)

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 Playwright 浏览器

```bash
npx playwright install chromium
```

### 3. 运行测试

```bash
npm run test:e2e
```

就这么简单！测试将自动打开浏览器并执行所有测试用例。

## 测试内容

- ✅ 页面加载
- ✅ AI智能收治按钮
- ✅ 患者列表显示
- ✅ 添加患者功能
- ✅ 响应式设计
- ✅ 导航功能
- ✅ 控制台错误检查

## 查看结果

- **控制台**: 实时查看测试进度和结果
- **截图**: `tests/screenshots/` 目录包含所有测试截图

## 常用命令

```bash
# 可视化模式运行（看得见浏览器）
npm run test:e2e

# 无头模式运行（后台运行）
npm run test:e2e:headless

# 直接运行脚本
node tests/e2e-test.js
```

## 需要帮助？

查看 `tests/README.md` 获取完整文档。
