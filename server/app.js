const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const { readDb, writeDb } = require('./storage');
const { analyzeWithQwen } = require('./qwen-vision');
const { generatePatientPDF } = require('./pdf-generator');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

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

  // Log all incoming requests
  app.use((req, res, next) => {
    console.log(`[请求] ${req.method} ${req.url} - Content-Type: ${req.headers['content-type'] || 'none'}`);
    next();
  });

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

  // AI Case Management Endpoints
  app.post('/api/cases', (req, res, next) => {
    console.log('[上传] 准备处理文件上传...');
    upload.array('files', 10)(req, res, (err) => {
      if (err) {
        console.error('[上传] Multer错误:', err.message);
        console.error('[上传] 错误代码:', err.code);
        console.error('[上传] 错误堆栈:', err.stack);
        return res.status(400).json({
          error: '文件上传失败',
          message: err.message,
          code: err.code
        });
      }
      next();
    });
  }, async (req, res) => {
    try {
      console.log('[上传文件] 开始处理上传请求');
      console.log('[上传文件] Content-Type:', req.headers['content-type']);

      const db = readDb();
      const files = req.files || [];

      console.log('[上传文件] 收到文件数量:', files.length);

      if (!files.length) {
        console.log('[上传文件] 错误: 没有文件');
        return res.status(400).json({ error: '请上传至少一张图片' });
      }

      // Log file details
      files.forEach((file, idx) => {
        console.log(`[上传文件] 文件${idx + 1}: ${file.originalname}, 大小: ${Math.round(file.size / 1024)}KB, 类型: ${file.mimetype}`);
      });

      // Store files as base64 in memory case
      const images = files.map((file) => ({
        name: file.originalname,
        mimeType: file.mimetype,
        data: file.buffer.toString('base64'),
      }));

      const caseId = newId('case');
      const caseData = {
        id: caseId,
        images,
        createdAt: nowIso(),
        status: 'uploaded',
      };

      // Store in db.cases (create array if doesn't exist)
      if (!db.cases) db.cases = [];
      db.cases.push(caseData);

      console.log('[上传文件] 准备写入数据库...');
      await writeDb(db);
      console.log('[上传文件] 数据库写入成功');

      const response = { success: true, caseId, imageCount: images.length };
      console.log('[上传文件] 返回响应:', response);
      res.status(201).json(response);
    } catch (err) {
      console.error('[上传文件] 处理失败:', err.message);
      console.error('[上传文件] 错误堆栈:', err.stack);
      res.status(500).json({
        error: '文件上传失败',
        message: err.message,
        details: err.stack
      });
    }
  });

  app.post('/api/cases/:caseId/analyze', async (req, res) => {
    const db = readDb();
    const caseId = req.params.caseId;

    console.log(`[AI分析] 开始分析病例 ${caseId}`);

    if (!db.cases) db.cases = [];
    const caseData = db.cases.find((c) => c.id === caseId);

    if (!caseData) {
      console.error(`[AI分析] 病例不存在: ${caseId}`);
      return res.status(404).json({ error: '病例不存在' });
    }

    if (!caseData.images || caseData.images.length === 0) {
      console.error(`[AI分析] 病例没有图片: ${caseId}`);
      return res.status(400).json({ error: '病例没有图片' });
    }

    console.log(`[AI分析] 病例 ${caseId} 包含 ${caseData.images.length} 张图片`);

    try {
      // Extract base64 data from all images
      const base64Images = caseData.images.map((img) => img.data);

      // Log image sizes for debugging
      const imageSizes = base64Images.map((img, idx) => ({
        index: idx,
        sizeKB: Math.round(img.length / 1024)
      }));
      console.log(`[AI分析] 图片大小:`, imageSizes);

      // Call Qwen Vision API to analyze images and generate rehabilitation plan
      console.log(`[AI分析] 开始调用Qwen API...`);
      const startTime = Date.now();
      const result = await analyzeWithQwen(base64Images);
      const duration = Date.now() - startTime;
      console.log(`[AI分析] API调用完成，耗时: ${duration}ms`);

      if (!result || !result.patient || !result.rehabPlan) {
        throw new Error('AI分析失败：返回数据格式不正确');
      }

      // Update case with analysis result
      caseData.status = 'analyzed';
      caseData.aiResult = result;
      caseData.extractedData = result.patient;
      caseData.rehabPlan = result.rehabPlan;
      caseData.analyzedAt = nowIso();

      const caseIdx = db.cases.findIndex((c) => c.id === caseId);
      if (caseIdx >= 0) {
        db.cases[caseIdx] = caseData;
        await writeDb(db);
      }

      console.log(`[AI分析] 分析成功，患者: ${result.patient.name || '未知'}`);
      res.json(result);
    } catch (err) {
      console.error(`[AI分析] 分析失败 (${caseId}):`, err.message);
      console.error(err.stack);
      res.status(500).json({
        error: 'AI分析失败',
        message: err.message || '未知错误'
      });
    }
  });

  // PDF Export Endpoint
  app.get('/api/patients/:id/export-pdf', async (req, res) => {
    try {
      const patientId = req.params.id;
      console.log(`[PDF导出] 开始生成患者 ${patientId} 的PDF文档`);

      const db = readDb();

      // Find patient
      const patient = db.patients.find((p) => p.id === patientId);
      if (!patient) {
        return res.status(404).json({ error: '患者不存在' });
      }

      // Get related records
      const records = db.records.filter((r) => r.patientId === patientId);
      const rehabSessions = db.rehabSessions.filter((s) => s.patientId === patientId);

      console.log(`[PDF导出] 患者: ${patient.name}, 病历: ${records.length}条, 康复记录: ${rehabSessions.length}次`);

      // Generate PDF
      const pdfBuffer = await generatePatientPDF(patient, records, rehabSessions);

      console.log(`[PDF导出] PDF生成成功，大小: ${Math.round(pdfBuffer.length / 1024)}KB`);

      // Set response headers
      const filename = `${patient.name}_康复治疗档案_${localIsoDate()}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);
    } catch (err) {
      console.error('[PDF导出] 生成失败:', err.message);
      console.error(err.stack);
      res.status(500).json({
        error: 'PDF生成失败',
        message: err.message
      });
    }
  });

  // Global error handler - must be after all routes
  app.use((err, req, res, next) => {
    console.error('[全局错误] 捕获到未处理的错误:');
    console.error('[全局错误] URL:', req.method, req.url);
    console.error('[全局错误] 错误:', err.message);
    console.error('[全局错误] 堆栈:', err.stack);

    res.status(err.status || 500).json({
      error: '服务器内部错误',
      message: err.message,
      path: req.url
    });
  });

  return app;
}

module.exports = { createApp };
