# E2E 测试文档

## 概述

本测试套件使用 Playwright 对康复护理链接系统进行端到端（E2E）测试。

## 测试目标

- **目标网址**: http://ey.yushuo.click

## 测试覆盖范围

1. **页面加载测试** - 验证页面能否正常加载和渲染
2. **AI智能收治按钮测试** - 检查AI收治功能按钮是否存在且可用
3. **患者列表显示测试** - 验证患者列表能否正确显示
4. **添加患者功能测试** - 测试添加患者功能是否正常工作
5. **页面响应性测试** - 测试不同屏幕尺寸下的显示效果
6. **导航功能测试** - 验证页面导航是否正常
7. **控制台错误检查** - 检查是否存在JavaScript错误

## 安装依赖

首次运行前，需要安装测试依赖：

```bash
npm install
```

然后安装 Playwright 浏览器：

```bash
npx playwright install chromium
```

## 运行测试

### 可视化模式（推荐用于开发和调试）

```bash
npm run test:e2e
```

这将打开浏览器窗口，您可以看到测试的实际执行过程。

### 无头模式（推荐用于CI/CD）

```bash
npm run test:e2e:headless
```

这将在后台运行测试，不显示浏览器窗口。

### 直接运行

```bash
node tests/e2e-test.js
```

## 测试结果

### 控制台输出

测试运行时，控制台会显示：
- 每个测试的执行状态（通过/失败）
- 详细的测试步骤信息
- 最终的测试报告统计

### 截图

测试过程中会自动保存截图到 `tests/screenshots/` 目录，包括：
- 页面加载后的截图
- 发现AI按钮时的截图
- 患者列表的截图
- 添加患者表单的截图
- 不同视口大小的截图
- 错误发生时的截图

## 配置选项

在 `tests/e2e-test.js` 中的 `CONFIG` 对象可以修改以下参数：

```javascript
const CONFIG = {
  baseURL: 'http://ey.yushuo.click',  // 测试目标URL
  timeout: 30000,                      // 超时时间（毫秒）
  headless: false,                     // 是否无头模式
  slowMo: 100,                         // 操作延迟（毫秒）
};
```

## 测试示例输出

```
============================================================
  康复护理链接系统 E2E 测试
============================================================

ℹ 启动浏览器...
✓ 浏览器启动成功

ℹ 运行测试: 1. 页面加载测试
ℹ 访问: http://ey.yushuo.click
ℹ 页面标题: 康复护理链接系统
✓ 通过: 1. 页面加载测试

ℹ 运行测试: 2. AI智能收治按钮存在性测试
✓ 找到AI智能收治按钮
✓ 通过: 2. AI智能收治按钮存在性测试

...

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

## 故障排查

### 测试超时

如果测试经常超时，可以增加 `CONFIG.timeout` 的值：

```javascript
timeout: 60000,  // 增加到60秒
```

### 浏览器未安装

如果提示找不到浏览器，运行：

```bash
npx playwright install
```

### 网络问题

确保能够访问 http://ey.yushuo.click，可以先在浏览器中手动访问确认。

### 元素未找到

测试脚本使用多种选择器策略来查找元素。如果特定测试失败，检查：
1. 截图文件，了解当时的页面状态
2. 控制台输出的详细信息
3. 页面结构是否发生变化

## 持续集成

可以将测试集成到CI/CD流程中：

### GitHub Actions 示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e:headless
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: screenshots
          path: tests/screenshots/
```

## 扩展测试

要添加新的测试用例，使用 `test()` 函数：

```javascript
await test('测试名称', async () => {
  // 测试逻辑
  const element = await page.waitForSelector('selector');
  if (!element) {
    throw new Error('元素未找到');
  }
  success('测试通过');
});
```

## 注意事项

1. **生产环境测试** - 当前脚本会访问生产环境，在"添加患者"测试中不会实际提交数据，以避免污染数据库
2. **测试隔离** - 每次测试都应该是独立的，不依赖其他测试的状态
3. **截图存储** - 截图文件会随时间累积，定期清理 `tests/screenshots/` 目录

## 维护

- 定期更新依赖：`npm update`
- 更新 Playwright：`npx playwright install`
- 检查测试用例是否与最新的UI匹配

## 支持

如有问题，请查看：
- [Playwright 文档](https://playwright.dev/)
- [项目 Issue Tracker](#)
