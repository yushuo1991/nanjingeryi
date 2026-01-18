const fs = require('fs');
const path = require('path');

// Simple in-memory lock for write operations
let writeLock = Promise.resolve();

function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nowIso() {
  return new Date().toISOString();
}

function createSeedDb() {
  const today = localIsoDate();
  const createdAt = nowIso();
  const updatedAt = createdAt;

  const patients = [
    {
      id: 'pat_demo_1',
      name: '张小宝',
      gender: '男',
      birthDate: '2023-08-12',
      guardianName: '张妈妈',
      phone: '13800000001',
      department: '新生儿科',
      bedNo: '01',
      diagnosis: '早产儿随访',
      notes: '演示数据：用于展示患者信息与关联记录。',
      createdAt,
      updatedAt,
    },
    {
      id: 'pat_demo_2',
      name: '李小米',
      gender: '女',
      birthDate: '2022-11-03',
      guardianName: '李爸爸',
      phone: '13800000002',
      department: '儿科',
      bedNo: '02',
      diagnosis: '支气管炎恢复期',
      notes: '演示数据：用于展示康复护理与病历管理。',
      createdAt,
      updatedAt,
    },
  ];

  const records = [
    {
      id: 'rec_demo_1',
      patientId: 'pat_demo_1',
      title: '入院记录',
      type: 'text',
      date: today,
      text: '主诉：喂养困难。\n现病史：早产后入院观察。\n处理：监测生命体征，指导喂养。',
      attachmentName: '',
      ocr: null,
      createdAt,
      updatedAt,
    },
    {
      id: 'rec_demo_2',
      patientId: 'pat_demo_2',
      title: '病程记录',
      type: 'text',
      date: today,
      text: '症状：咳嗽减轻，精神可。\n体征：呼吸音较前改善。\n建议：继续雾化与呼吸训练。',
      attachmentName: '',
      ocr: null,
      createdAt,
      updatedAt,
    },
  ];

  const rehabSessions = [
    {
      id: 'rehab_demo_1',
      patientId: 'pat_demo_1',
      date: today,
      items: [
        { id: 'item_demo_1a', name: '呼吸训练 15min', completedAt: null },
        { id: 'item_demo_1b', name: '吞咽训练 10min', completedAt: null },
      ],
      notes: '演示数据：可勾选完成并保存备注。',
      createdAt,
      updatedAt,
    },
    {
      id: 'rehab_demo_2',
      patientId: 'pat_demo_2',
      date: today,
      items: [
        { id: 'item_demo_2a', name: '拍背排痰 10min', completedAt: null },
        { id: 'item_demo_2b', name: '步态训练 15min', completedAt: null },
      ],
      notes: '演示数据：用于展示今日康复计划统计。',
      createdAt,
      updatedAt,
    },
  ];

  return { patients, records, rehabSessions };
}

function getDbPath() {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  const dataDir = process.env.DATA_DIR ? process.env.DATA_DIR : path.join(__dirname, 'data');
  return path.join(dataDir, 'db.json');
}

function ensureDataDir() {
  const dbPath = getDbPath();
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(createSeedDb(), null, 2), 'utf8');
  }
}

function readDb() {
  ensureDataDir();
  const raw = fs.readFileSync(getDbPath(), 'utf8');
  const db = JSON.parse(raw);
  return {
    patients: Array.isArray(db.patients) ? db.patients : [],
    records: Array.isArray(db.records) ? db.records : [],
    rehabSessions: Array.isArray(db.rehabSessions) ? db.rehabSessions : [],
  };
}

function writeDb(db) {
  ensureDataDir();
  const dbPath = getDbPath();
  const tmpPath = `${dbPath}.${process.pid}.tmp`;

  // Queue write operation to prevent race conditions
  writeLock = writeLock.then(() => {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
        fs.renameSync(tmpPath, dbPath);
        resolve();
      } catch (err) {
        // Clean up temp file if it exists
        if (fs.existsSync(tmpPath)) {
          try {
            fs.unlinkSync(tmpPath);
          } catch (_) {}
        }
        reject(err);
      }
    });
  });

  return writeLock;
}

module.exports = { readDb, writeDb };
