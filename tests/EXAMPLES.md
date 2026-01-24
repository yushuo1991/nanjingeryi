# E2E 测试使用示例

## 场景1: 首次运行测试

```bash
# 步骤1: 安装项目依赖
npm install

# 步骤2: 安装 Playwright 浏览器
npx playwright install chromium

# 步骤3: 运行测试（可视化模式）
npm run test:e2e
```

预期输出:
```
============================================================
  康复护理链接系统 E2E 测试
============================================================

ℹ 启动浏览器...
✓ 浏览器启动成功

ℹ 运行测试: 1. 页面加载测试
✓ 通过: 1. 页面加载测试

ℹ 运行测试: 2. AI智能收治按钮存在性测试
✓ 通过: 2. AI智能收治按钮存在性测试

... (更多测试)

============================================================
  测试报告
============================================================

总测试数: 7
通过: 7
失败: 0
通过率: 100.00%
耗时: 25.43秒

✓ 🎉 所有测试通过！
```

---

## 场景2: CI/CD 自动化测试

在 GitHub Actions 中自动运行:

1. 代码已包含 `.github/workflows/e2e-tests.yml`
2. 每次 push 到 main 或 develop 分支时自动触发
3. 每天凌晨2点自动运行一次
4. 可以手动触发

查看测试结果:
- GitHub Actions 界面查看日志
- 如果测试失败，可下载截图artifacts

---

## 场景3: 本地调试失败的测试

```bash
# 运行可视化模式，便于观察问题
npm run test:e2e

# 查看截图
ls -lh tests/screenshots/

# 打开最新的截图
open tests/screenshots/*.png  # macOS
start tests/screenshots/*.png  # Windows
xdg-open tests/screenshots/*.png  # Linux
```

---

## 场景4: 测试不同的URL

```bash
# 方式1: 修改 tests/e2e-test.js 中的 CONFIG.baseURL

# 方式2: 使用环境变量
TEST_URL=http://localhost:5173 npm run test:e2e
```

---

## 场景5: 加速测试执行

```bash
# 使用无头模式（后台运行，不显示浏览器）
npm run test:e2e:headless

# 或者修改 tests/e2e-test.js
# slowMo: 0  (移除延迟)
# headless: true  (无头模式)
```

---

## 场景6: 只运行特定测试

编辑 `tests/e2e-test.js`，注释掉不需要的测试:

```javascript
// ==================== 主测试套件 ====================
async function runTests() {
  // ... 浏览器初始化代码 ...

  // 运行测试1
  await test('1. 页面加载测试', async () => { ... });

  // 注释掉不需要的测试
  // await test('2. AI智能收治按钮存在性测试', async () => { ... });

  // 只运行需要的测试
  await test('3. 患者列表显示测试', async () => { ... });

  // ...
}
```

---

## 场景7: 生成测试报告

当前测试会在控制台输出详细报告。如需HTML报告，可以：

```bash
# 重定向输出到文件
npm run test:e2e > test-report.txt 2>&1

# 查看报告
cat test-report.txt
```

---

## 场景8: 并行测试多个环境

创建多个配置文件:

```bash
# 测试生产环境
TEST_URL=http://ey.yushuo.click npm run test:e2e:headless

# 测试本地开发环境
TEST_URL=http://localhost:5173 npm run test:e2e:headless

# 测试预发布环境
TEST_URL=http://staging.example.com npm run test:e2e:headless
```

---

## 场景9: 定期健康检查

使用 cron job 定期运行测试:

```bash
# Linux/macOS - 编辑 crontab
crontab -e

# 添加: 每天凌晨3点运行测试
0 3 * * * cd /path/to/rehab-care-link && npm run test:e2e:headless

# Windows - 使用任务计划程序创建计划任务
```

---

## 场景10: 集成到开发流程

### Git Hooks (使用 husky)

```bash
# 安装 husky
npm install --save-dev husky

# 初始化 husky
npx husky init

# 添加 pre-push hook
echo "npm run test:e2e:headless" > .husky/pre-push
```

这样每次 git push 前都会自动运行测试。

---

## 常见问题解决

### 问题1: 测试超时

```javascript
// 在 tests/e2e-test.js 中增加超时时间
const CONFIG = {
  timeout: 60000,  // 改为60秒
  // ...
};
```

### 问题2: 找不到元素

查看截图文件，确认页面结构:
```bash
ls -lt tests/screenshots/ | head
```

### 问题3: 网络错误

检查是否能访问测试URL:
```bash
curl -I http://ey.yushuo.click
```

### 问题4: 浏览器安装失败

重新安装浏览器:
```bash
npx playwright install --force chromium
```

---

## 进阶用法

### 自定义测试选择器

编辑 `tests/config.js`:

```javascript
export const config = {
  selectors: {
    aiButton: [
      'button:has-text("您的按钮文本")',
      '[data-testid="ai-button"]',
    ],
  },
};
```

### 添加自定义测试

在 `tests/e2e-test.js` 中添加:

```javascript
await test('我的自定义测试', async () => {
  const element = await page.waitForSelector('selector');
  const text = await element.textContent();

  if (!text.includes('expected')) {
    throw new Error('测试失败');
  }

  success('自定义测试通过');
});
```

---

## 性能优化建议

1. **使用无头模式**: 更快的执行速度
2. **减少 slowMo**: 设置为 0 以最快速度运行
3. **并行测试**: 如果有多个测试套件，可以并行运行
4. **缓存依赖**: 使用 npm ci 代替 npm install

---

## 最佳实践

1. 定期运行测试（每天至少一次）
2. 在部署前运行完整测试套件
3. 保留失败测试的截图
4. 及时更新测试用例以匹配UI变化
5. 不要在生产环境执行写操作（已内置保护）

---

## 获取帮助

- 查看 `tests/README.md` 获取完整文档
- 查看 `tests/QUICKSTART.md` 快速开始
- 查看 Playwright 官方文档: https://playwright.dev/
