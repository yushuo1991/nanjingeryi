const mysql = require('mysql2/promise');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getMysqlConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: requiredEnv('MYSQL_USER'),
    password: requiredEnv('MYSQL_PASSWORD'),
    database: requiredEnv('MYSQL_DATABASE'),
    connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 10),
    charset: 'utf8mb4',
  };
}

let pool = null;

async function getPool() {
  if (pool) return pool;
  pool = mysql.createPool(getMysqlConfig());
  await pool.query('SELECT 1');
  return pool;
}

async function migrate() {
  const p = await getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      status VARCHAR(32) NOT NULL DEFAULT 'created',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS case_files (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      case_id BIGINT UNSIGNED NOT NULL,
      path VARCHAR(512) NOT NULL,
      mime VARCHAR(128) NOT NULL,
      sha256 CHAR(64) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_case_id (case_id),
      CONSTRAINT fk_case_files_case_id FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS ai_runs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      case_id BIGINT UNSIGNED NOT NULL,
      kind VARCHAR(32) NOT NULL,
      model VARCHAR(64) NOT NULL,
      request_json JSON NOT NULL,
      response_json JSON NULL,
      parsed_json JSON NULL,
      error_text TEXT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_case_kind (case_id, kind),
      CONSTRAINT fk_ai_runs_case_id FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      data JSON NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS rehab_plans (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      patient_id BIGINT UNSIGNED NOT NULL,
      case_id BIGINT UNSIGNED NULL,
      plan_json JSON NOT NULL,
      confirmed TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY idx_patient (patient_id),
      CONSTRAINT fk_rehab_plans_patient_id FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      CONSTRAINT fk_rehab_plans_case_id FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

module.exports = { getPool, migrate };

