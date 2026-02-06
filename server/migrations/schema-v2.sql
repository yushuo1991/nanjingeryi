-- ============================================================================
-- RehabCareLink Database Schema V2 - Normalized Structure
-- ============================================================================
-- This schema normalizes the current JSON blob storage in the patients table
-- into a proper relational structure with separate tables for each entity.
--
-- Migration Date: 2026-02-06
-- Target: SQLite 3.x with better-sqlite3
-- ============================================================================

-- ============================================================================
-- 1. DEPARTMENTS TABLE
-- ============================================================================
-- Stores department/ward information
-- Replaces: patients.data.department (string field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

CREATE TRIGGER IF NOT EXISTS departments_updated_at
AFTER UPDATE ON departments
BEGIN
  UPDATE departments SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 2. PATIENTS TABLE (NORMALIZED)
-- ============================================================================
-- Core patient demographic and admission information
-- Replaces: patients.data (JSON blob) with structured columns
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Basic Demographics
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('男', '女', '未知')),
  age TEXT NOT NULL,  -- Stored as text: "5岁3个月" or "3岁"

  -- Admission Information
  bed_no TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  diagnosis TEXT NOT NULL,
  admission_date TEXT,  -- ISO date format: YYYY-MM-DD

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'discharged', 'transferred', 'archived')),
  today_treated INTEGER NOT NULL DEFAULT 0,  -- Boolean: 0 or 1

  -- GAS Score
  gas_score INTEGER,  -- Overall GAS score (0-100)

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_patients_v2_name ON patients_v2(name);
CREATE INDEX IF NOT EXISTS idx_patients_v2_bed_no ON patients_v2(bed_no);
CREATE INDEX IF NOT EXISTS idx_patients_v2_department ON patients_v2(department_id);
CREATE INDEX IF NOT EXISTS idx_patients_v2_status ON patients_v2(status);
CREATE INDEX IF NOT EXISTS idx_patients_v2_admission_date ON patients_v2(admission_date);

CREATE TRIGGER IF NOT EXISTS patients_v2_updated_at
AFTER UPDATE ON patients_v2
BEGIN
  UPDATE patients_v2 SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 3. SAFETY ALERTS TABLE
-- ============================================================================
-- Stores safety alerts and risk warnings for patients
-- Replaces: patients.data.safetyAlerts (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS safety_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  alert_text TEXT NOT NULL,
  alert_type TEXT DEFAULT 'warning' CHECK(alert_type IN ('warning', 'danger', 'info')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (patient_id) REFERENCES patients_v2(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_patient ON safety_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_active ON safety_alerts(is_active);

CREATE TRIGGER IF NOT EXISTS safety_alerts_updated_at
AFTER UPDATE ON safety_alerts
BEGIN
  UPDATE safety_alerts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 4. GAS GOALS TABLE
-- ============================================================================
-- Stores Goal Attainment Scaling (GAS) goals for patients
-- Replaces: patients.data.gasGoals (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gas_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  goal_name TEXT NOT NULL,
  current_score INTEGER NOT NULL DEFAULT 0,
  target_score INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (patient_id) REFERENCES patients_v2(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gas_goals_patient ON gas_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_gas_goals_active ON gas_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_gas_goals_order ON gas_goals(patient_id, display_order);

CREATE TRIGGER IF NOT EXISTS gas_goals_updated_at
AFTER UPDATE ON gas_goals
BEGIN
  UPDATE gas_goals SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 5. TREATMENT PLANS TABLE
-- ============================================================================
-- Stores treatment plan metadata for patients
-- Replaces: patients.data.treatmentPlan (object field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  focus TEXT NOT NULL,  -- Main treatment focus
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (patient_id) REFERENCES patients_v2(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_active ON treatment_plans(is_active);

CREATE TRIGGER IF NOT EXISTS treatment_plans_updated_at
AFTER UPDATE ON treatment_plans
BEGIN
  UPDATE treatment_plans SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 6. TREATMENT ITEMS TABLE
-- ============================================================================
-- Stores individual treatment items within a treatment plan
-- Replaces: patients.data.treatmentPlan.items (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_plan_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  icon TEXT,  -- Emoji icon
  duration TEXT,  -- e.g., "15min", "20分钟"
  frequency TEXT,
  intensity TEXT,
  notes TEXT,
  completed INTEGER NOT NULL DEFAULT 0,  -- Boolean: 0 or 1
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_items_plan ON treatment_items(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_items_order ON treatment_items(treatment_plan_id, display_order);

CREATE TRIGGER IF NOT EXISTS treatment_items_updated_at
AFTER UPDATE ON treatment_items
BEGIN
  UPDATE treatment_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 7. TREATMENT ITEM DETAILS TABLE
-- ============================================================================
-- Stores detailed steps, monitoring, and stop criteria for treatment items
-- Replaces: patients.data.treatmentPlan.items[].steps/monitoring/stopCriteria
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_item_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_item_id INTEGER NOT NULL,
  detail_type TEXT NOT NULL CHECK(detail_type IN ('step', 'monitoring', 'stop_criteria')),
  detail_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (treatment_item_id) REFERENCES treatment_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_item_details_item ON treatment_item_details(treatment_item_id);
CREATE INDEX IF NOT EXISTS idx_treatment_item_details_type ON treatment_item_details(treatment_item_id, detail_type);

-- ============================================================================
-- 8. TREATMENT PLAN HIGHLIGHTS TABLE
-- ============================================================================
-- Stores daily highlights/focus points for treatment plans
-- Replaces: patients.data.treatmentPlan.highlights (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_plan_id INTEGER NOT NULL,
  highlight_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_highlights_plan ON treatment_highlights(treatment_plan_id);

-- ============================================================================
-- 9. TREATMENT PRECAUTIONS TABLE
-- ============================================================================
-- Stores precautions and contraindications for treatment plans
-- Replaces: patients.data.treatmentPlan.precautions (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_precautions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_plan_id INTEGER NOT NULL,
  precaution_text TEXT NOT NULL,
  precaution_type TEXT DEFAULT 'precaution' CHECK(precaution_type IN ('precaution', 'contraindication')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_precautions_plan ON treatment_precautions(treatment_plan_id);

-- ============================================================================
-- 10. TREATMENT LOGS TABLE
-- ============================================================================
-- Stores daily treatment execution logs
-- Replaces: patients.data.treatmentLogs (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  log_date TEXT NOT NULL,  -- ISO date format: YYYY-MM-DD
  therapist_name TEXT,
  highlight TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (patient_id) REFERENCES patients_v2(id) ON DELETE CASCADE,
  UNIQUE(patient_id, log_date)  -- One log per patient per day
);

CREATE INDEX IF NOT EXISTS idx_treatment_logs_patient ON treatment_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_logs_date ON treatment_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_treatment_logs_patient_date ON treatment_logs(patient_id, log_date);

CREATE TRIGGER IF NOT EXISTS treatment_logs_updated_at
AFTER UPDATE ON treatment_logs
BEGIN
  UPDATE treatment_logs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 11. TREATMENT LOG ITEMS TABLE
-- ============================================================================
-- Stores which treatment items were executed in each log
-- Replaces: patients.data.treatmentLogs[].items (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_log_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_log_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (treatment_log_id) REFERENCES treatment_logs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treatment_log_items_log ON treatment_log_items(treatment_log_id);

-- ============================================================================
-- 12. HOMEWORK TABLE
-- ============================================================================
-- Stores homework assignments for patients
-- Replaces: patients.data.homework (array field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS homework (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_date TEXT NOT NULL,  -- ISO date format: YYYY-MM-DD
  due_date TEXT,
  completed INTEGER NOT NULL DEFAULT 0,  -- Boolean: 0 or 1
  completed_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (patient_id) REFERENCES patients_v2(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_homework_patient ON homework(patient_id);
CREATE INDEX IF NOT EXISTS idx_homework_completed ON homework(completed);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);

CREATE TRIGGER IF NOT EXISTS homework_updated_at
AFTER UPDATE ON homework
BEGIN
  UPDATE homework SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- 13. MIGRATION METADATA TABLE
-- ============================================================================
-- Tracks migration status and history
-- ============================================================================
CREATE TABLE IF NOT EXISTS migration_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  rollback_available INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

-- ============================================================================
-- VIEWS FOR BACKWARD COMPATIBILITY
-- ============================================================================
-- These views can help maintain backward compatibility during transition
-- ============================================================================

-- View: patients_summary
-- Provides a quick summary of patients with their department names
CREATE VIEW IF NOT EXISTS patients_summary AS
SELECT
  p.id,
  p.name,
  p.gender,
  p.age,
  p.bed_no,
  d.name AS department,
  p.diagnosis,
  p.admission_date,
  p.status,
  p.today_treated,
  p.gas_score,
  p.created_at,
  p.updated_at
FROM patients_v2 p
LEFT JOIN departments d ON p.department_id = d.id;

-- View: active_patients
-- Shows only active patients
CREATE VIEW IF NOT EXISTS active_patients AS
SELECT * FROM patients_summary WHERE status = 'active';

-- ============================================================================
-- SEED DATA FOR DEPARTMENTS
-- ============================================================================
-- Insert common departments (will be populated during migration)
-- ============================================================================
INSERT OR IGNORE INTO departments (name, code, is_active) VALUES
  ('呼吸内科', 'RESP', 1),
  ('神经康复科', 'NEURO', 1),
  ('骨科康复科', 'ORTHO', 1),
  ('心脏康复科', 'CARDIO', 1),
  ('儿童康复科', 'PEDS', 1),
  ('重症康复科', 'ICU', 1);

-- ============================================================================
-- END OF SCHEMA V2
-- ============================================================================
