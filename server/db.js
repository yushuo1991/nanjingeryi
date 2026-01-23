const sqlite3 = require('better-sqlite3');
const path = require('path');

let db = null;

function getDb() {
  if (db) return db;

  const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, 'rehab_care.db');
  db = new sqlite3(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  return db;
}

// 模拟MySQL的query方法，返回 [rows, fields] 格式
function query(sql, params = []) {
  const db = getDb();

  // 处理SELECT查询
  if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('SHOW')) {
    const rows = db.prepare(sql).all(...params);
    return Promise.resolve([rows, []]);
  }

  // 处理INSERT/UPDATE/DELETE
  const info = db.prepare(sql).run(...params);
  return Promise.resolve([{
    insertId: info.lastInsertRowid,
    affectedRows: info.changes
  }, []]);
}

// 创建一个类似MySQL pool的对象
function createPool() {
  return {
    query: query,
    end: () => {
      if (db) {
        db.close();
        db = null;
      }
      return Promise.resolve();
    }
  };
}

let pool = null;

async function getPool() {
  if (pool) return pool;

  // 初始化数据库
  getDb();
  pool = createPool();

  return pool;
}

async function migrate() {
  const db = getDb();

  // Cases table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Create trigger for updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS cases_updated_at
    AFTER UPDATE ON cases
    BEGIN
      UPDATE cases SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  // Case files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS case_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      mime TEXT NOT NULL,
      sha256 TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON case_files(case_id);
  `);

  // AI runs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      model TEXT NOT NULL,
      request_json TEXT NOT NULL,
      response_json TEXT,
      parsed_json TEXT,
      error_text TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ai_runs_case_kind ON ai_runs(case_id, kind);
  `);

  // Patients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS patients_updated_at
    AFTER UPDATE ON patients
    BEGIN
      UPDATE patients SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  // Rehab plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rehab_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      case_id INTEGER,
      plan_json TEXT NOT NULL,
      confirmed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rehab_plans_patient ON rehab_plans(patient_id);
  `);
}

module.exports = { getPool, migrate };
