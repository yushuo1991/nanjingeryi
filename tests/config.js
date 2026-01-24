/**
 * E2E 测试配置文件
 * 可以通过修改此文件来自定义测试行为
 */

export const config = {
  // 测试目标URL
  baseURL: process.env.TEST_URL || 'http://ey.yushuo.click',

  // 超时设置（毫秒）
  timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,

  // 是否无头模式（不显示浏览器）
  headless: process.env.HEADLESS === 'true' || false,

  // 操作延迟（毫秒），用于观察测试过程
  slowMo: parseInt(process.env.SLOW_MO) || 100,

  // 浏览器视口大小
  viewport: {
    width: 1920,
    height: 1080,
  },

  // 截图设置
  screenshots: {
    enabled: true,
    dir: 'tests/screenshots',
    fullPage: true,
  },

  // 测试数据
  testData: {
    patient: {
      name: '测试患者' + Date.now(),
      age: '5岁',
      gender: '男',
      bedNo: '101-1',
      department: '呼吸内科',
    },
  },

  // 响应式测试视口
  responsiveViewports: [
    { width: 1920, height: 1080, name: '桌面 (1920x1080)' },
    { width: 1366, height: 768, name: '笔记本 (1366x768)' },
    { width: 768, height: 1024, name: '平板 (768x1024)' },
    { width: 375, height: 667, name: '手机 (375x667)' },
  ],

  // 选择器策略（用于查找元素）
  selectors: {
    aiButton: [
      'button:has-text("AI智能收治")',
      'button:has-text("智能收治")',
      'button:has-text("AI收治")',
      'button:has-text("收治")',
    ],
    patientList: [
      '[class*="patient-list"]',
      '[class*="patientList"]',
      '[class*="patient"][class*="container"]',
      'div:has(> div[class*="patient"])',
    ],
    addButton: [
      'button:has-text("添加患者")',
      'button:has-text("新增患者")',
      'button:has-text("添加")',
      'button:has-text("+")',
    ],
  },

  // 是否在生产环境执行写操作（建议设为false）
  allowProductionWrite: false,

  // 重试设置
  retries: 2,
};

export default config;
