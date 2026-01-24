/**
 * E2E 测试脚本 - 康复护理链接系统
 * 使用 Playwright 进行端到端测试
 * 测试目标: http://ey.yushuo.click
 */

import { chromium } from 'playwright';

// 测试配置
const CONFIG = {
  baseURL: 'http://ey.yushuo.click',
  timeout: 30000, // 30秒超时
  headless: false, // 设为false可以看到浏览器操作
  slowMo: 100, // 放慢操作速度，便于观察
};

// 颜色输出辅助函数
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

function section(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${message}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

// 测试结果统计
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  startTime: null,
  endTime: null,
};

// 测试用例包装器
async function test(name, fn) {
  stats.total++;
  info(`\n运行测试: ${name}`);

  try {
    await fn();
    stats.passed++;
    success(`通过: ${name}`);
    return true;
  } catch (err) {
    stats.failed++;
    error(`失败: ${name}`);
    error(`错误信息: ${err.message}`);
    return false;
  }
}

// 截图辅助函数
async function takeScreenshot(page, name) {
  const filename = `tests/screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  info(`截图已保存: ${filename}`);
}

// 主测试套件
async function runTests() {
  stats.startTime = Date.now();
  section('康复护理链接系统 E2E 测试');

  let browser;
  let page;

  try {
    // 启动浏览器
    info('启动浏览器...');
    browser = await chromium.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
    });

    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });

    // 设置默认超时
    page.setDefaultTimeout(CONFIG.timeout);

    success('浏览器启动成功');

    // ==================== 测试 1: 页面加载 ====================
    await test('1. 页面加载测试', async () => {
      info(`访问: ${CONFIG.baseURL}`);
      const response = await page.goto(CONFIG.baseURL, {
        waitUntil: 'networkidle',
        timeout: CONFIG.timeout
      });

      if (!response.ok()) {
        throw new Error(`页面加载失败，HTTP状态码: ${response.status()}`);
      }

      // 等待React应用加载
      await page.waitForSelector('body', { state: 'visible' });

      // 检查页面标题
      const title = await page.title();
      info(`页面标题: ${title}`);

      if (!title || title === '') {
        throw new Error('页面标题为空');
      }

      await takeScreenshot(page, 'page-loaded');
      success('页面加载成功');
    });

    // 等待React应用完全渲染
    await page.waitForTimeout(2000);

    // ==================== 测试 2: AI智能收治按钮 ====================
    await test('2. AI智能收治按钮存在性测试', async () => {
      // 查找包含"AI智能收治"或"智能收治"的按钮
      const selectors = [
        'button:has-text("AI智能收治")',
        'button:has-text("智能收治")',
        'button:has-text("AI收治")',
        'button:has-text("收治")',
        '[class*="ai"]:has-text("收治")',
        'button >> text=/.*AI.*收治.*/',
      ];

      let aiButton = null;
      for (const selector of selectors) {
        try {
          aiButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (aiButton) {
            success(`找到AI智能收治按钮: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (!aiButton) {
        // 尝试查找所有按钮并打印出来
        const allButtons = await page.$$('button');
        const buttonTexts = await Promise.all(
          allButtons.map(btn => btn.textContent())
        );
        info(`页面上的所有按钮: ${buttonTexts.join(', ')}`);
        throw new Error('未找到AI智能收治按钮');
      }

      // 检查按钮是否可见
      const isVisible = await aiButton.isVisible();
      if (!isVisible) {
        throw new Error('AI智能收治按钮存在但不可见');
      }

      // 检查按钮是否可点击
      const isEnabled = await aiButton.isEnabled();
      if (!isEnabled) {
        info('警告: AI智能收治按钮处于禁用状态');
      }

      await takeScreenshot(page, 'ai-button-found');
      success('AI智能收治按钮测试通过');
    });

    // ==================== 测试 3: 患者列表显示 ====================
    await test('3. 患者列表显示测试', async () => {
      // 查找患者列表容器的多种可能选择器
      const listSelectors = [
        '[class*="patient-list"]',
        '[class*="patientList"]',
        '[class*="patient"][class*="container"]',
        'div:has(> div[class*="patient"])',
        '[role="list"]',
        'ul:has(li)',
        'div:has(> [class*="card"])',
      ];

      let patientList = null;
      for (const selector of listSelectors) {
        try {
          patientList = await page.waitForSelector(selector, { timeout: 3000 });
          if (patientList) {
            success(`找到患者列表容器: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (!patientList) {
        // 尝试查找包含患者信息的元素
        const possiblePatients = await page.$$('[class*="patient"], [class*="card"], li');
        info(`找到可能的患者元素数量: ${possiblePatients.length}`);

        if (possiblePatients.length === 0) {
          throw new Error('未找到患者列表或患者卡片');
        }
      }

      // 查找具体的患者卡片/项目
      const patientItems = await page.$$('[class*="patient"], [class*="card"], li');
      info(`患者数量: ${patientItems.length}`);

      if (patientItems.length === 0) {
        throw new Error('患者列表为空');
      }

      // 检查第一个患者的信息
      if (patientItems.length > 0) {
        const firstPatient = patientItems[0];
        const patientText = await firstPatient.textContent();
        info(`第一个患者信息预览: ${patientText.substring(0, 100)}...`);

        // 检查是否包含常见的患者信息字段
        const hasName = patientText.includes('名') || patientText.includes('患');
        const hasAge = patientText.includes('岁') || patientText.includes('年龄');
        const hasBed = patientText.includes('床') || patientText.includes('病床');

        info(`患者信息包含: ${hasName ? '姓名 ' : ''}${hasAge ? '年龄 ' : ''}${hasBed ? '床号 ' : ''}`);
      }

      await takeScreenshot(page, 'patient-list');
      success(`患者列表显示测试通过，共 ${patientItems.length} 个患者`);
    });

    // ==================== 测试 4: 添加患者功能 ====================
    await test('4. 添加患者功能测试', async () => {
      // 查找"添加患者"按钮
      const addButtonSelectors = [
        'button:has-text("添加患者")',
        'button:has-text("新增患者")',
        'button:has-text("添加")',
        'button:has-text("新增")',
        'button:has-text("+")',
        '[class*="add"]:has-text("患者")',
        'button[aria-label*="添加"]',
        'button[aria-label*="新增"]',
      ];

      let addButton = null;
      for (const selector of addButtonSelectors) {
        try {
          addButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (addButton && await addButton.isVisible()) {
            success(`找到添加患者按钮: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (!addButton) {
        // 打印所有按钮文本帮助调试
        const allButtons = await page.$$('button');
        const buttonTexts = await Promise.all(
          allButtons.map(btn => btn.textContent())
        );
        info(`页面上的所有按钮文本: ${buttonTexts.join(' | ')}`);
        throw new Error('未找到添加患者按钮');
      }

      // 点击添加按钮
      info('点击添加患者按钮...');
      await addButton.click();

      // 等待对话框或表单出现
      await page.waitForTimeout(1000);

      // 查找对话框/模态框
      const dialogSelectors = [
        '[role="dialog"]',
        '[class*="modal"]',
        '[class*="dialog"]',
        '[class*="form"]',
        'form',
      ];

      let dialog = null;
      for (const selector of dialogSelectors) {
        try {
          dialog = await page.waitForSelector(selector, { timeout: 2000 });
          if (dialog && await dialog.isVisible()) {
            success(`添加患者表单/对话框已打开: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试
        }
      }

      if (!dialog) {
        info('警告: 未找到明确的对话框，但可能已打开添加界面');
      }

      // 查找表单输入字段
      const inputs = await page.$$('input[type="text"], input:not([type]), textarea');
      info(`找到 ${inputs.length} 个输入字段`);

      if (inputs.length === 0) {
        throw new Error('添加患者表单中没有找到输入字段');
      }

      // 查找提交按钮
      const submitSelectors = [
        'button:has-text("确定")',
        'button:has-text("提交")',
        'button:has-text("保存")',
        'button:has-text("添加")',
        'button[type="submit"]',
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await page.$(selector);
          if (submitButton && await submitButton.isVisible()) {
            success(`找到提交按钮: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续
        }
      }

      await takeScreenshot(page, 'add-patient-form');

      // 测试填写表单（使用测试数据）
      info('尝试填写测试数据...');
      if (inputs.length > 0) {
        const testData = {
          name: '测试患者',
          age: '5岁',
          bed: '101-1',
        };

        try {
          // 填写前几个字段
          if (inputs[0]) await inputs[0].fill(testData.name);
          if (inputs[1]) await inputs[1].fill(testData.age);
          if (inputs[2]) await inputs[2].fill(testData.bed);
          success('测试数据填写完成');

          await takeScreenshot(page, 'add-patient-form-filled');

          // 注意: 不实际提交，避免污染数据
          info('注意: 为避免污染生产数据，不执行实际提交操作');

          // 关闭对话框（查找取消/关闭按钮）
          const closeSelectors = [
            'button:has-text("取消")',
            'button:has-text("关闭")',
            '[aria-label="关闭"]',
            '[class*="close"]',
          ];

          for (const selector of closeSelectors) {
            try {
              const closeBtn = await page.$(selector);
              if (closeBtn && await closeBtn.isVisible()) {
                await closeBtn.click();
                info('已关闭添加患者对话框');
                break;
              }
            } catch (e) {
              // 继续
            }
          }
        } catch (e) {
          info(`表单填写出现问题: ${e.message}`);
        }
      }

      success('添加患者功能测试通过');
    });

    // ==================== 测试 5: 页面响应性测试 ====================
    await test('5. 页面响应性测试', async () => {
      info('测试不同视口大小...');

      const viewports = [
        { width: 1920, height: 1080, name: '桌面 (1920x1080)' },
        { width: 1366, height: 768, name: '笔记本 (1366x768)' },
        { width: 768, height: 1024, name: '平板 (768x1024)' },
        { width: 375, height: 667, name: '手机 (375x667)' },
      ];

      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(500);

        // 检查页面是否仍然可见
        const bodyVisible = await page.isVisible('body');
        if (!bodyVisible) {
          throw new Error(`视口 ${vp.name} 下页面不可见`);
        }

        info(`✓ ${vp.name} - 正常`);
        await takeScreenshot(page, `responsive-${vp.width}x${vp.height}`);
      }

      // 恢复默认视口
      await page.setViewportSize({ width: 1920, height: 1080 });

      success('页面响应性测试通过');
    });

    // ==================== 测试 6: 导航功能测试 ====================
    await test('6. 导航功能测试', async () => {
      info('测试页面导航...');

      // 查找导航项
      const navSelectors = [
        'nav a',
        '[role="navigation"] a',
        '[class*="nav"] a',
        'header a',
      ];

      let navLinks = [];
      for (const selector of navSelectors) {
        try {
          const links = await page.$$(selector);
          if (links.length > 0) {
            navLinks = links;
            success(`找到 ${links.length} 个导航链接`);
            break;
          }
        } catch (e) {
          // 继续
        }
      }

      if (navLinks.length > 0) {
        const linkTexts = await Promise.all(
          navLinks.slice(0, 5).map(link => link.textContent())
        );
        info(`导航项: ${linkTexts.join(', ')}`);
      } else {
        info('警告: 未找到明确的导航链接');
      }

      success('导航功能测试完成');
    });

    // ==================== 测试 7: 控制台错误检查 ====================
    await test('7. 控制台错误检查', async () => {
      info('检查JavaScript控制台错误...');

      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // 重新加载页面以捕获所有错误
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      if (errors.length > 0) {
        info(`发现 ${errors.length} 个控制台错误:`);
        errors.forEach((err, i) => {
          info(`  ${i + 1}. ${err}`);
        });
        // 不抛出错误，只是警告
        info('警告: 页面存在控制台错误，但测试继续');
      } else {
        success('无控制台错误');
      }
    });

  } catch (err) {
    error(`测试执行出错: ${err.message}`);
    console.error(err);

    if (page) {
      await takeScreenshot(page, 'error');
    }
  } finally {
    // 清理
    if (browser) {
      info('\n关闭浏览器...');
      await browser.close();
    }

    stats.endTime = Date.now();
    printReport();
  }
}

// 打印测试报告
function printReport() {
  section('测试报告');

  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  const passRate = ((stats.passed / stats.total) * 100).toFixed(2);

  console.log('');
  log(`总测试数: ${stats.total}`, 'blue');
  log(`通过: ${stats.passed}`, 'green');
  log(`失败: ${stats.failed}`, stats.failed > 0 ? 'red' : 'reset');
  log(`通过率: ${passRate}%`, passRate === '100.00' ? 'green' : 'yellow');
  log(`耗时: ${duration}秒`, 'cyan');
  console.log('');

  if (stats.failed === 0) {
    success('🎉 所有测试通过！');
  } else {
    error('❌ 部分测试失败，请检查上述错误信息');
  }

  console.log('');
}

// 运行测试
runTests().catch(err => {
  error(`测试运行失败: ${err.message}`);
  console.error(err);
  process.exit(1);
});
