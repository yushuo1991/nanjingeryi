const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const { readDb, writeDb } = require('./storage');

function nowIso() {
  return new Date().toISOString();
}

function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function newId(prefix) {
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return `${prefix}_${id}`;
}

function pick(value, fallback) {
  return value === undefined || value === null ? fallback : value;
}

function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(corsOrigin ? cors({ origin: corsOrigin, credentials: true }) : cors());
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/dashboard', (_req, res) => {
    const db = readDb();
    const today = localIsoDate();
    const todaySessions = db.rehabSessions.filter((s) => s.date === today);

    res.json({
      patientsCount: db.patients.length,
      recordsCount: db.records.length,
      todaySessionsCount: todaySessions.length,
      recentPatients: db.patients.slice(-5).reverse(),
      recentRecords: db.records.slice(-5).reverse(),
    });
  });

  app.get('/api/patients', (req, res) => {
    const db = readDb();
    const q = (req.query.q || '').toString().trim().toLowerCase();
    const items = q
      ? db.patients.filter((p) =>
          [p.name, p.phone, p.bedNo, p.department, p.diagnosis]
            .filter(Boolean)
            .some((v) => v.toString().toLowerCase().includes(q))
        )
      : db.patients;
    res.json(items);
  });

  app.post('/api/patients', async (req, res) => {
    const db = readDb();
    const payload = req.body || {};
    if (!payload.name) return res.status(400).json({ error: 'name is required' });

    const patient = {
      id: newId('pat'),
      name: payload.name,
      gender: pick(payload.gender, ''),
      birthDate: pick(payload.birthDate, ''),
      guardianName: pick(payload.guardianName, ''),
      phone: pick(payload.phone, ''),
      department: pick(payload.department, ''),
      bedNo: pick(payload.bedNo, ''),
      diagnosis: pick(payload.diagnosis, ''),
      notes: pick(payload.notes, ''),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    db.patients.push(patient);
    await writeDb(db);
    res.status(201).json(patient);
  });

  app.put('/api/patients/:id', async (req, res) => {
    const db = readDb();
    const idx = db.patients.findIndex((p) => p.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'not found' });

    const current = db.patients[idx];
    const payload = req.body || {};
    const updated = {
      ...current,
      name: pick(payload.name, current.name),
      gender: pick(payload.gender, current.gender),
      birthDate: pick(payload.birthDate, current.birthDate),
      guardianName: pick(payload.guardianName, current.guardianName),
      phone: pick(payload.phone, current.phone),
      department: pick(payload.department, current.department),
      bedNo: pick(payload.bedNo, current.bedNo),
      diagnosis: pick(payload.diagnosis, current.diagnosis),
      notes: pick(payload.notes, current.notes),
      updatedAt: nowIso(),
    };

    db.patients[idx] = updated;
    await writeDb(db);
    res.json(updated);
  });

  app.delete('/api/patients/:id', async (req, res) => {
    const db = readDb();
    const before = db.patients.length;
    db.patients = db.patients.filter((p) => p.id !== req.params.id);
    if (db.patients.length === before) return res.status(404).json({ error: 'not found' });

    db.records = db.records.filter((r) => r.patientId !== req.params.id);
    db.rehabSessions = db.rehabSessions.filter((s) => s.patientId !== req.params.id);
    await writeDb(db);
    res.status(204).end();
  });

  app.get('/api/records', (req, res) => {
    const db = readDb();
    const patientId = (req.query.patientId || '').toString();
    const items = patientId ? db.records.filter((r) => r.patientId === patientId) : db.records;
    res.json(items);
  });

  app.post('/api/records', async (req, res) => {
    const db = readDb();
    const payload = req.body || {};
    if (!payload.patientId) return res.status(400).json({ error: 'patientId is required' });
    const patient = db.patients.find((p) => p.id === payload.patientId);
    if (!patient) return res.status(400).json({ error: 'patientId not found' });

    const record = {
      id: newId('rec'),
      patientId: payload.patientId,
      title: pick(payload.title, '病历记录'),
      type: pick(payload.type, 'text'),
      date: pick(payload.date, localIsoDate()),
      text: pick(payload.text, ''),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    db.records.push(record);
    await writeDb(db);
    res.status(201).json(record);
  });

  app.get('/api/rehab/sessions', (req, res) => {
    const db = readDb();
    const date = (req.query.date || localIsoDate()).toString();
    const patientId = (req.query.patientId || '').toString();
    const items = db.rehabSessions.filter((s) => s.date === date && (!patientId || s.patientId === patientId));
    res.json(items);
  });

  app.post('/api/rehab/sessions', async (req, res) => {
    const db = readDb();
    const payload = req.body || {};
    if (!payload.patientId) return res.status(400).json({ error: 'patientId is required' });
    const patient = db.patients.find((p) => p.id === payload.patientId);
    if (!patient) return res.status(400).json({ error: 'patientId not found' });

    const date = pick(payload.date, localIsoDate());
    const existing = db.rehabSessions.find((s) => s.patientId === payload.patientId && s.date === date);
    if (existing) return res.status(409).json({ error: 'session already exists for this patient and date', session: existing });

    const items = Array.isArray(payload.items) ? payload.items : [];
    const session = {
      id: newId('rehab'),
      patientId: payload.patientId,
      date,
      items: items
        .map((it) => ({
          id: newId('item'),
          name: pick(it?.name, ''),
          completedAt: null,
        }))
        .filter((it) => it.name),
      notes: pick(payload.notes, ''),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    db.rehabSessions.push(session);
    await writeDb(db);
    res.status(201).json(session);
  });

  app.patch('/api/rehab/sessions/:id', async (req, res) => {
    const db = readDb();
    const idx = db.rehabSessions.findIndex((s) => s.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'not found' });

    const session = db.rehabSessions[idx];
    const payload = req.body || {};

    const nextItems = Array.isArray(payload.items)
      ? payload.items.map((it) => {
          const rawId = it?.id;
          const id = !rawId || (typeof rawId === 'string' && rawId.startsWith('tmp_')) ? newId('item') : rawId;
          return {
            id,
            name: pick(it?.name, ''),
            completedAt: pick(it?.completedAt, null),
          };
        })
      : session.items;

    const updated = {
      ...session,
      items: nextItems,
      notes: pick(payload.notes, session.notes),
      updatedAt: nowIso(),
    };

    db.rehabSessions[idx] = updated;
    await writeDb(db);
    res.json(updated);
  });

  return app;
}

module.exports = { createApp };
