const { getPool } = require('./db');

function twoDemoPatients() {
  return [
    {
      name: '小明',
      age: '5岁3个月',
      gender: '男',
      bedNo: '301-1',
      department: '呼吸内科',
      diagnosis: '支气管肺炎恢复期',
      admissionDate: '2026-01-05',
      status: 'active',
      todayTreated: false,
      safetyAlerts: ['防跌倒'],
      gasScore: 65,
      gasGoals: [
        { name: '呼吸功能', target: 80, current: 70 },
        { name: '运动耐力', target: 75, current: 55 },
      ],
      treatmentPlan: {
        focus: '改善呼吸功能，增强运动耐力',
        highlights: ['演示数据：用于展示训练方案与注意事项'],
        items: [
          { id: 1, name: '呼吸训练', icon: '🫁', duration: '15min', completed: false, note: '腹式呼吸+缩唇呼吸' },
          { id: 2, name: '运动训练', icon: '🏃', duration: '20min', completed: false, note: '步行训练，监测血氧' },
        ],
        precautions: ['运动时监测血氧饱和度，低于94%停止', '避免过度疲劳，遵医嘱'],
      },
      treatmentLogs: [],
      homework: [],
    },
    {
      name: '小红',
      age: '3岁8个月',
      gender: '女',
      bedNo: '302-2',
      department: '呼吸内科',
      diagnosis: '哮喘急性发作恢复期',
      admissionDate: '2026-01-08',
      status: 'active',
      todayTreated: true,
      safetyAlerts: ['过敏体质', '避免冷空气刺激'],
      gasScore: 45,
      gasGoals: [{ name: '呼吸控制', target: 85, current: 50 }],
      treatmentPlan: {
        focus: '哮喘康复训练，提高呼吸控制能力',
        highlights: ['演示数据：可用于生成方案并确认入库'],
        items: [{ id: 1, name: '游戏呼吸训练', icon: '🎮', duration: '15min', completed: true, note: '吹泡泡游戏' }],
        precautions: ['严禁接触过敏原', '备好急救药物，遵医嘱'],
      },
      treatmentLogs: [],
      homework: [],
    },
  ];
}

async function seedIfEmpty() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM patients');
  const count = Number(rows?.[0]?.c || 0);
  if (count > 0) return;
  const items = twoDemoPatients();
  for (const p of items) {
    await pool.query('INSERT INTO patients (data) VALUES (?)', [JSON.stringify({ id: null, ...p })]);
  }
}

module.exports = { seedIfEmpty };

