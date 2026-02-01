require('dotenv').config();

const cors = require('cors');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

let JSON5 = null;
try {
  JSON5 = require('json5');
} catch {
  JSON5 = null;
}

let sharp = null;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

let playwrightChromium = null;
try {
  ({ chromium: playwrightChromium } = require('playwright'));
} catch {
  playwrightChromium = null;
}

const { getPool, migrate } = require('./db');
const { buildStoredPath, sha256File, uploadDir } = require('./files');
const {
  callQwenVision,
  buildExtractPrompt,
  buildExtractPromptForMissing,
  buildPlanPrompt,
  buildLogPrompt,
  buildAnalyzePrompt,
  buildAnalyzePromptForMissing,
  extractJsonFromText,
} = require('./qwen');
const { seedIfEmpty } = require('./seed');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function jsonError(res, status, message, extra = {}) {
  res.status(status).json({ success: false, error: message, ...extra });
}

function toLocalIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(corsOrigin ? cors({ origin: corsOrigin, credentials: true }) : cors());
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', async (_req, res) => {
    try {
      const pool = await getPool();
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'ok' });
    } catch (e) {
      res.status(500).json({ status: 'error', db: 'error', error: e.message });
    }
  });

  // ---------------- PDF Report (A4, B/W) ----------------
  let pdfBrowserPromise = null;
  async function getPdfBrowser() {
    if (!playwrightChromium) throw new Error('PDF engine not installed');
    if (!pdfBrowserPromise) {
      // Reuse a single browser across requests for speed.
      pdfBrowserPromise = playwrightChromium.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return pdfBrowserPromise;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtDateCn(iso) {
    const s = String(iso || '').trim();
    if (!s) return '';
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return s;
    return `${m[1]}年${m[2]}月${m[3]}日`;
  }

  function buildFormalReportHtml(patient) {
    const p = patient || {};
    const now = new Date();
    const todayIso = toLocalIsoDate(now);
    const title = `康复治疗记录单（${escapeHtml(p.department || '')}）`;

    const safety = Array.isArray(p.safetyAlerts) ? p.safetyAlerts : [];
    const gasGoals = Array.isArray(p.gasGoals) ? p.gasGoals : [];
    const plan = p.treatmentPlan && typeof p.treatmentPlan === 'object' ? p.treatmentPlan : {};
    const items = Array.isArray(plan.items) ? plan.items : [];
    const precautions = Array.isArray(plan.precautions) ? plan.precautions : [];
    const highlights = Array.isArray(plan.highlights) ? plan.highlights : [];

    const logs = Array.isArray(p.treatmentLogs) ? p.treatmentLogs : [];
    const latestLog = logs.length ? logs[0] : null;
    const todayLog = logs.find((l) => String(l?.date || '') === todayIso) || null;

    const itemRows = items.map((it, idx) => {
      const done = Boolean(it?.completed);
      return `
        <tr>
          <td class="c center">${idx + 1}</td>
          <td class="c">${escapeHtml(it?.name || '')}</td>
          <td class="c center">${escapeHtml(it?.duration || '')}</td>
          <td class="c center">${done ? '√' : ''}</td>
          <td class="c">${escapeHtml(it?.note || it?.notes || '')}</td>
        </tr>
      `;
    }).join('');

    const goalRows = gasGoals.slice(0, 2).map((g, idx) => `
      <tr>
        <td class="c center">${idx + 1}</td>
        <td class="c">${escapeHtml(g?.name || '')}</td>
        <td class="c center">${escapeHtml(g?.current ?? '')}</td>
        <td class="c center">${escapeHtml(g?.target ?? '')}</td>
      </tr>
    `).join('');

    const logRows = logs.slice(0, 7).map((l) => {
      const date = fmtDateCn(l?.date);
      const itemsText = Array.isArray(l?.items) ? l.items.join('、') : '';
      return `
        <tr>
          <td class="c center">${escapeHtml(date)}</td>
          <td class="c">${escapeHtml(itemsText)}</td>
          <td class="c">${escapeHtml(l?.highlight || '')}</td>
          <td class="c">${escapeHtml(l?.notes || '')}</td>
          <td class="c center">${escapeHtml(l?.therapist || '')}</td>
        </tr>
      `;
    }).join('');

    const printDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    html, body { background: #fff; color: #000; }
    body { font-family: "Noto Sans CJK SC","Noto Sans CJK","Microsoft YaHei","SimSun","Songti SC",serif; font-size: 12pt; line-height: 1.35; }
    .wrap { width: 100%; }
    .h1 { text-align: center; font-size: 18pt; font-weight: 700; margin: 0 0 6mm; }
    .meta { display: flex; justify-content: space-between; font-size: 10.5pt; margin-bottom: 4mm; }
    .meta div { white-space: nowrap; }
    .box { border: 1px solid #000; padding: 3mm; margin-bottom: 4mm; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 2.2mm 2.4mm; vertical-align: top; }
    th { text-align: center; font-weight: 700; }
    .center { text-align: center; }
    .small { font-size: 10.5pt; }
    .section { font-weight: 700; margin: 0 0 2mm; }
    .sig { display: flex; justify-content: space-between; gap: 10mm; margin-top: 6mm; }
    .sig .line { display: inline-block; width: 45mm; border-bottom: 1px solid #000; height: 8mm; vertical-align: bottom; }
    .muted { color: #000; }
    .nowrap { white-space: nowrap; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="h1">${escapeHtml(title)}</div>
    <div class="meta">
      <div>打印日期：${escapeHtml(fmtDateCn(printDate))}</div>
      <div>记录日期：${escapeHtml(fmtDateCn(todayLog?.date || latestLog?.date || todayIso))}</div>
    </div>

    <div class="box">
      <div class="section">一、患者基本信息</div>
      <table class="small">
        <tr>
          <th class="nowrap">姓名</th><td>${escapeHtml(p.name || '')}</td>
          <th class="nowrap">性别</th><td>${escapeHtml(p.gender || '')}</td>
          <th class="nowrap">年龄</th><td>${escapeHtml(p.age || '')}</td>
        </tr>
        <tr>
          <th class="nowrap">床号</th><td>${escapeHtml(p.bedNo || '')}</td>
          <th class="nowrap">科室</th><td>${escapeHtml(p.department || '')}</td>
          <th class="nowrap">入院日期</th><td>${escapeHtml(fmtDateCn(p.admissionDate || ''))}</td>
        </tr>
        <tr>
          <th class="nowrap">诊断</th>
          <td colspan="5">${escapeHtml(p.diagnosis || '')}</td>
        </tr>
      </table>
    </div>

    <div class="box">
      <div class="section">二、安全提醒 / 风险提示（黑白打印）</div>
      <div class="small">${escapeHtml((safety.slice(0, 2).join('；')) || '无')}</div>
    </div>

    <div class="box">
      <div class="section">三、康复目标（GAS）</div>
      <table class="small">
        <tr><th style="width:10mm">序号</th><th>目标</th><th style="width:22mm">当前</th><th style="width:22mm">目标</th></tr>
        ${goalRows || '<tr><td class="c center">1</td><td class="c"></td><td class="c center"></td><td class="c center"></td></tr><tr><td class="c center">2</td><td class="c"></td><td class="c center"></td><td class="c center"></td></tr>'}
      </table>
    </div>

    <div class="box">
      <div class="section">四、今日个体化重点</div>
      <div class="small">${escapeHtml(highlights.slice(0, 2).join('；') || '—')}</div>
    </div>

    <div class="box">
      <div class="section">五、今日治疗计划与执行情况</div>
      <div class="small" style="margin-bottom:2mm;"><b>治疗重点：</b>${escapeHtml(plan.focus || '')}</div>
      <table class="small">
        <tr>
          <th style="width:10mm">序号</th>
          <th>训练项目</th>
          <th style="width:22mm">时长</th>
          <th style="width:14mm">完成</th>
          <th>要点/备注</th>
        </tr>
        ${itemRows || '<tr><td class="c center">1</td><td class="c"></td><td class="c center"></td><td class="c center"></td><td class="c"></td></tr><tr><td class="c center">2</td><td class="c"></td><td class="c center"></td><td class="c center"></td><td class="c"></td></tr><tr><td class="c center">3</td><td class="c"></td><td class="c center"></td><td class="c center"></td><td class="c"></td></tr>'}
      </table>
      <div class="small" style="margin-top:3mm;"><b>注意事项/禁忌（2条）：</b>${escapeHtml(precautions.slice(0, 2).join('；') || '—')}</div>
    </div>

    <div class="box">
      <div class="section">六、当日治疗记录（供管床医生查阅）</div>
      <table class="small">
        <tr>
          <th style="width:28mm">记录日期</th>
          <th style="width:42mm">已执行项目</th>
          <th>当日要点</th>
          <th>备注/反应</th>
        </tr>
        <tr>
          <td class="c center">${escapeHtml(fmtDateCn(todayLog?.date || todayIso))}</td>
          <td class="c">${escapeHtml(Array.isArray(todayLog?.items) ? todayLog.items.join('、') : (items.filter((it) => it.completed).map((it) => it.name).join('、')))}</td>
          <td class="c">${escapeHtml(todayLog?.highlight || '')}</td>
          <td class="c">${escapeHtml(todayLog?.notes || '')}</td>
        </tr>
      </table>
      <div class="sig small">
        <div>治疗师签名：<span class="line"></span></div>
        <div>管床医生签名：<span class="line"></span></div>
      </div>
    </div>

    <div class="box">
      <div class="section">七、近期治疗记录（最近7条）</div>
      <table class="small">
        <tr>
          <th style="width:24mm">日期</th>
          <th style="width:46mm">项目</th>
          <th>要点</th>
          <th>备注</th>
          <th style="width:22mm">治疗师</th>
        </tr>
        ${logRows || '<tr><td class="c center"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c center"></td></tr>'}
      </table>
    </div>

    <div class="small muted">说明：本记录供临床沟通与病区查房使用；请结合实际情况与医嘱复核。</div>
  </div>
</body>
</html>`;
  }

  app.get('/api/patients/:id/report.pdf', async (req, res) => {
    const patientId = Number(req.params.id);
    if (!patientId) return jsonError(res, 400, 'Invalid patientId');
    try {
      const pool = await getPool();
      const [[row]] = await pool.query('SELECT id, data FROM patients WHERE id=?', [patientId]);
      if (!row) return jsonError(res, 404, 'Patient not found');
      const patient = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      patient.id = Number(row.id);

      const html = buildFormalReportHtml(patient);
      const browser = await getPdfBrowser();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: false,
        preferCSSPageSize: true,
        margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
      });
      await page.close();

      const safeName = String(patient?.name || '患者').replace(/[\\/:*?"<>|]/g, '_');
      const safeBed = String(patient?.bedNo || '').replace(/[\\/:*?"<>|]/g, '_');
      const filename = `治疗记录_${safeName}${safeBed ? '_' + safeBed : ''}_${toLocalIsoDate()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      res.send(pdf);
    } catch (e) {
      const msg = e?.message || 'Generate PDF failed';
      if (String(msg).includes('PDF engine not installed')) return jsonError(res, 503, 'PDF 引擎未安装（playwright）');
      jsonError(res, 500, msg);
    }
  });

  // ---------------- Uploads / Cases ----------------
  const mem = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
  const supportedMimes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  app.post('/api/cases', mem.array('files', 10), async (req, res) => {
    console.log('[POST /api/cases] Request received, files count:', req.files?.length || 0);
    try {
      const files = req.files || [];
      console.log('[POST /api/cases] Files parsed:', files.length);
      if (!files.length) return jsonError(res, 400, 'No files uploaded');

      console.log('[POST /api/cases] Getting DB pool...');
      const pool = await getPool();
      console.log('[POST /api/cases] Inserting case into DB...');
      const [r] = await pool.query('INSERT INTO cases (status) VALUES (?)', ['created']);
      const caseId = Number(r.insertId);
      console.log('[POST /api/cases] Case created, ID:', caseId);

      const saved = [];
      for (const f of files) {
        console.log('[POST /api/cases] Processing file:', f.originalname, 'mime:', f.mimetype);
        const mime = f.mimetype || 'application/octet-stream';
        if (!mime.startsWith('image/')) return jsonError(res, 400, 'Only image uploads are supported');
        if (!supportedMimes.has(mime)) {
          return jsonError(res, 400, `Unsupported image type: ${mime}. Please convert to JPG/PNG/WebP`);
        }

        const storedPath = buildStoredPath(f.originalname, mime);
        console.log('[POST /api/cases] Stored path:', storedPath);

        // 确保上传目录存在
        const uploadDir = path.dirname(storedPath);
        if (!fs.existsSync(uploadDir)) {
          console.log('[POST /api/cases] Creating upload dir:', uploadDir);
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 尝试写入文件
        try {
          console.log('[POST /api/cases] Writing file, size:', f.buffer?.length || 0, 'bytes');
          fs.writeFileSync(storedPath, f.buffer);
          console.log('[POST /api/cases] File written successfully');
        } catch (writeError) {
          console.error('[POST /api/cases] Failed to write file:', writeError);
          return jsonError(res, 500, `Failed to save file: ${writeError.message}. Check upload directory permissions.`);
        }

        console.log('[POST /api/cases] Calculating SHA256...');
        const sha = sha256File(storedPath);
        console.log('[POST /api/cases] SHA256:', sha);

        console.log('[POST /api/cases] Inserting file record into DB...');
        await pool.query(
          'INSERT INTO case_files (case_id, path, mime, sha256) VALUES (?,?,?,?)',
          [caseId, storedPath, mime, sha]
        );
        saved.push({ path: storedPath, mime, sha256: sha });
      }

      console.log('[POST /api/cases] Updating case status...');
      await pool.query('UPDATE cases SET status=? WHERE id=?', ['uploaded', caseId]);
      console.log('[POST /api/cases] Success! Sending response...');
      res.status(201).json({ success: true, caseId, files: saved });
    } catch (error) {
      console.error('[POST /api/cases] FATAL ERROR:', error);
      console.error('[POST /api/cases] Error stack:', error.stack);
      return jsonError(res, 500, `Failed to create case: ${error.message}`);
    }
  });

  app.get('/api/cases/:id', async (req, res) => {
    const caseId = Number(req.params.id);
    if (!caseId) return jsonError(res, 400, 'Invalid caseId');
    const pool = await getPool();
    const [[c]] = await pool.query('SELECT * FROM cases WHERE id=?', [caseId]);
    if (!c) return jsonError(res, 404, 'Case not found');
    const [files] = await pool.query('SELECT id, path, mime, sha256, created_at FROM case_files WHERE case_id=? ORDER BY id ASC', [caseId]);
    res.json({ success: true, case: c, files });
  });

  // Return browser-safe URLs for case attachments (no raw server paths in frontend)
  app.get('/api/cases/:id/files', async (req, res) => {
    const caseId = Number(req.params.id);
    if (!caseId) return jsonError(res, 400, 'Invalid caseId');
    const pool = await getPool();
    const [files] = await pool.query('SELECT id, mime FROM case_files WHERE case_id=? ORDER BY id ASC', [caseId]);
    const items = files.map((f) => ({
      id: Number(f.id),
      mime: f.mime,
      url: `/api/cases/${caseId}/files/${Number(f.id)}`,
    }));
    res.json({ success: true, items });
  });

  // Stream a case attachment
  app.get('/api/cases/:id/files/:fileId', async (req, res) => {
    const caseId = Number(req.params.id);
    const fileId = Number(req.params.fileId);
    if (!caseId || !fileId) return jsonError(res, 400, 'Invalid id');
    const pool = await getPool();
    const [[row]] = await pool.query('SELECT path, mime FROM case_files WHERE id=? AND case_id=?', [fileId, caseId]);
    if (!row) return jsonError(res, 404, 'File not found');
    try {
      res.setHeader('Content-Type', row.mime || 'application/octet-stream');
      fs.createReadStream(row.path).pipe(res);
    } catch (e) {
      jsonError(res, 500, e.message || 'Read file failed');
    }
  });

  async function fileToDataUrl(filePath, mime) {
    const buf = fs.readFileSync(filePath);
    if (!sharp) {
      const base64 = buf.toString('base64');
      return `data:${mime};base64,${base64}`;
    }
    try {
      const maxDim = Number(process.env.MAX_AI_IMAGE_DIM || 768);
      const quality = Number(process.env.AI_JPEG_QUALITY || 55);
      const image = sharp(buf);
      const meta = await image.metadata();
      const resized = meta.width > maxDim || meta.height > maxDim
        ? image.resize({ width: maxDim, height: maxDim, fit: 'inside' })
        : image;
      const out = await resized.jpeg({ quality }).toBuffer();
      return `data:image/jpeg;base64,${out.toString('base64')}`;
    } catch {
      const base64 = buf.toString('base64');
      return `data:${mime};base64,${base64}`;
    }
  }

  async function pickImageDataUrls(files) {
    const maxImages = Number(process.env.MAX_AI_IMAGES || 3);
    const out = [];
    for (const f of files.slice(0, maxImages)) {
      out.push(await fileToDataUrl(f.path, f.mime));
    }
    return out;
  }

  async function pickImageDataUrlsFromFiles(files, maxImages) {
    const out = [];
    for (const f of files.slice(0, maxImages)) {
      out.push(await fileToDataUrl(f.path, f.mime));
    }
    return out;
  }

  function uniqueBatches(batches) {
    const out = [];
    const seen = new Set();
    for (const batch of batches) {
      const key = (batch || []).map((f) => String(f?.id ?? f?.path ?? '')).join('|');
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(batch);
    }
    return out;
  }

  function buildExtractCandidateBatches(files) {
    const maxImages = Math.max(1, Number(process.env.MAX_AI_IMAGES || 3));
    const batches = [];
    batches.push(files.slice(0, maxImages));
    if (files.length > 1) {
      batches.push([...files].reverse().slice(0, maxImages));
      if (files.length > maxImages) batches.push(files.slice(-maxImages));
      // Some multimodal APIs/models effectively only use one image; single-image attempts let us merge fields across pages.
      for (const f of files) batches.push([f]);
    }
    return uniqueBatches(batches);
  }

  function asCleanString(value) {
    if (value === null || value === undefined) return '';
    const s = String(value).replace(/\s+/g, ' ').trim();
    return s;
  }

  function pickFirstString(...values) {
    for (const v of values) {
      const s = asCleanString(v);
      if (s) return s;
    }
    return '';
  }

  function normalizeGender(value) {
    const s = asCleanString(value);
    if (!s) return '未知';
    if (s === '男' || s === '女') return s;
    if (s.includes('男')) return '男';
    if (s.includes('女')) return '女';
    return '未知';
  }

  function normalizeExtractProfile(parsed) {
    const root = parsed && typeof parsed === 'object' ? parsed : {};
    const patient = (root.patient && typeof root.patient === 'object') ? root.patient : {};

    // Accept common alternative keys (including Chinese labels)
    const name = pickFirstString(patient.name, root.name, patient.patientName, patient.姓名, root.姓名);
    const age = pickFirstString(patient.age, root.age, patient.年龄, root.年龄, patient.birthDate, patient.出生日期, patient.出生年月);
    const bedNo = pickFirstString(
      patient.bedNo,
      patient.bed,
      patient.bed_no,
      patient.bedNumber,
      patient.床号,
      patient.床位,
      patient.床位号,
      root.bedNo,
      root.床号
    );
    const department = pickFirstString(patient.department, root.department, patient.科室, root.科室);
    const diagnosis = pickFirstString(
      patient.diagnosis,
      root.diagnosis,
      patient.admissionDiagnosis,
      patient.诊断,
      patient.入院诊断,
      root.诊断
    );
    const admissionDate = patient.admissionDate ?? root.admissionDate ?? null;

    const risks = Array.isArray(root.risks) ? root.risks : (Array.isArray(root.风险) ? root.风险 : []);
    const contraindications = Array.isArray(root.contraindications) ? root.contraindications : [];
    const monitoring = Array.isArray(root.monitoring) ? root.monitoring : [];
    const keyFindings = Array.isArray(root.keyFindings) ? root.keyFindings : [];
    const missingFields = Array.isArray(root.missingFields) ? root.missingFields : [];
    const confidence =
      root.confidence && typeof root.confidence === 'object'
        ? root.confidence
        : { patient: 0.5, diagnosis: 0.5, overall: 0.5 };

    return {
      patient: {
        name,
        gender: normalizeGender(patient.gender || root.gender || patient.性别 || root.性别),
        age,
        bedNo,
        department,
        diagnosis,
        admissionDate,
      },
      risks,
      contraindications,
      monitoring,
      keyFindings,
      missingFields,
      confidence,
    };
  }

  function clampPlan(parsed) {
    // Clamp model outputs to product limits so UI stays consistent.
    const asStr = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const clampArr = (arr, max) => (Array.isArray(arr) ? arr.map(asStr).filter(Boolean).slice(0, max) : []);
    const root = parsed && typeof parsed === 'object' ? parsed : {};

    const gasGoals = Array.isArray(root.gasGoals)
      ? root.gasGoals.slice(0, 2).map((g) => ({
          name: asStr(g?.name),
          target: Number(g?.target || 0) || 0,
          current: Number(g?.current || 0) || 0,
        }))
      : [];

    let items = Array.isArray(root.items)
      ? root.items.slice(0, 3).map((it) => ({
          name: asStr(it?.name),
          duration: asStr(it?.duration),
          frequency: asStr(it?.frequency),
          intensity: asStr(it?.intensity),
          steps: clampArr(it?.steps, 4),
          monitoring: clampArr(it?.monitoring, 2),
          stopCriteria: clampArr(it?.stopCriteria, 2),
          notes: asStr(it?.notes || it?.note),
        }))
      : [];

    // Enforce total duration <= 20 minutes (product requirement).
    const parseMinutes = (value) => {
      const s = String(value || '');
      const m = s.match(/(\d+)\s*(分钟|分|min|mins|minute)/i) || s.match(/(\d+)/);
      if (!m) return 0;
      return Math.max(0, Number(m[1]) || 0);
    };
    const totalMinutes = items.reduce((sum, it) => sum + parseMinutes(it.duration), 0);
    if (items.length && totalMinutes > 20) {
      const per = Math.max(1, Math.floor(20 / items.length));
      items = items.map((it) => ({ ...it, duration: `${per}分钟` }));
    }

    const review = root.review && typeof root.review === 'object' ? root.review : null;

    return {
      gasGoals,
      highlights: clampArr(root.highlights, 2),
      focus: asStr(root.focus),
      items,
      precautions: clampArr(root.precautions, 2),
      familyEducation: clampArr(root.familyEducation, 2),
      review: review ? { when: asStr(review.when), metrics: clampArr(review.metrics, 2) } : null,
    };
  }

  function missingKeyFields(profile) {
    const p = profile?.patient || {};
    const isMissing = (v) => !asCleanString(v) || asCleanString(v) === '未知';
    const missing = [];
    if (isMissing(p.name)) missing.push('姓名');
    if (isMissing(p.age)) missing.push('年龄/出生日期');
    if (isMissing(p.bedNo)) missing.push('床号');
    if (isMissing(p.diagnosis)) missing.push('诊断');
    return missing;
  }

  function mergeExtractCandidates(candidates = []) {
    const isKnown = (v) => {
      const s = asCleanString(v);
      return Boolean(s) && s !== '未知';
    };

    const pickKnown = (getter, fallback = '') => {
      for (const c of candidates) {
        const v = getter(c);
        if (isKnown(v)) return asCleanString(v);
      }
      return fallback;
    };

    const mergeStringArray = (getter, limit = 12) => {
      const out = [];
      const seen = new Set();
      for (const c of candidates) {
        const arr = getter(c);
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
          const s = asCleanString(item);
          if (!s || seen.has(s)) continue;
          seen.add(s);
          out.push(s);
          if (out.length >= limit) return out;
        }
      }
      return out;
    };

    return normalizeExtractProfile({
      patient: {
        name: pickKnown((c) => c?.patient?.name, ''),
        gender: pickKnown((c) => c?.patient?.gender, '未知'),
        age: pickKnown((c) => c?.patient?.age, ''),
        bedNo: pickKnown((c) => c?.patient?.bedNo, ''),
        department: pickKnown((c) => c?.patient?.department, ''),
        diagnosis: pickKnown((c) => c?.patient?.diagnosis, ''),
        admissionDate: pickKnown((c) => c?.patient?.admissionDate, null),
      },
      risks: mergeStringArray((c) => c?.risks, 10),
      contraindications: mergeStringArray((c) => c?.contraindications, 10),
      monitoring: mergeStringArray((c) => c?.monitoring, 12),
      keyFindings: mergeStringArray((c) => c?.keyFindings, 12),
      confidence: { patient: 0.6, diagnosis: 0.6, overall: 0.6 },
    });
  }

  async function callVisionJson({ imageDataUrls, prompt, requestTag, maxAttempts = 2 }) {
    function parseModelJsonText(text) {
      try {
        return extractJsonFromText(text);
      } catch {
        // Fall back to a small "JSON repair" for common model mistakes:
        // - unquoted object keys: {foo: 1}
        // - trailing commas
        // - smart quotes
        const first = String(text || '').indexOf('{');
        const last = String(text || '').lastIndexOf('}');
        if (first < 0 || last < 0 || last <= first) throw new Error('Model did not return JSON');
        let jsonText = String(text || '').slice(first, last + 1);

        const redact = (s) =>
          String(s || '')
            .replace(/"([^"\\]|\\.)*"/g, '"..."')
            .replace(/'([^'\\]|\\.)*'/g, "'...'");

        if (JSON5) {
          try {
            return JSON5.parse(jsonText);
          } catch (e) {
            console.warn('[ai][json5_parse_failed]', e?.message || String(e), 'tag=', requestTag, 'head=', redact(jsonText).slice(0, 240));
            // fall through to regex repair
          }
        }

        jsonText = jsonText
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
        try {
          return JSON.parse(jsonText);
        } catch (e) {
          console.warn('[ai][json_parse_failed]', e?.message || String(e), 'tag=', requestTag, 'head=', redact(jsonText).slice(0, 240));
          throw e;
        }
      }
    }

    let lastText = '';
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const refinedPrompt =
        attempt === 1
          ? prompt
          : `${prompt}\n\nIMPORTANT: Output STRICT JSON only (double-quoted keys, no trailing commas). Do not output any extra text.`;
      const { text } = await callQwenVision({
        imageDataUrls,
        prompt: refinedPrompt,
        requestTag: attempt === 1 ? requestTag : `${requestTag}_retryjson`,
        timeoutMs: Number(process.env.QWEN_TIMEOUT_MS || 45000),
      });
      lastText = text;
      try {
        return parseModelJsonText(text);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error(`Model did not return JSON: ${String(lastText || '').slice(0, 120)}`);
  }

  app.post('/api/cases/:id/extract', async (req, res) => {
    const caseId = Number(req.params.id);
    if (!caseId) return jsonError(res, 400, 'Invalid caseId');

    const pool = await getPool();
    const [files] = await pool.query('SELECT id, path, mime FROM case_files WHERE case_id=? ORDER BY id ASC', [caseId]);
    if (!files.length) return jsonError(res, 404, 'No files found for case');

    const model = process.env.QWEN_MODEL || 'qwen3-vl-plus';

    let runId = null;
    try {
      requiredEnv('DASHSCOPE_API_KEY');
    } catch (e) {
      return jsonError(res, 503, 'AI key not configured on server');
    }

    try {
      const batches = buildExtractCandidateBatches(files);
      const candidates = [];

      let best = null;
      let bestMissingCount = Infinity;

      for (let idx = 0; idx < batches.length; idx++) {
        const batchFiles = batches[idx];
        const imageDataUrls = await pickImageDataUrlsFromFiles(batchFiles, batchFiles.length);

        const parsed = await callVisionJson({
          imageDataUrls,
          prompt: buildExtractPrompt(),
          requestTag: `extract_${idx + 1}`,
        });
        const normalized = normalizeExtractProfile(parsed);
        candidates.push(normalized);

        const missing = missingKeyFields(normalized);
        if (missing.length) {
          // Focused retry for missing fields (same batch)
          const retryParsed = await callVisionJson({
            imageDataUrls,
            prompt: buildExtractPromptForMissing(missing),
            requestTag: `extract_retry_${idx + 1}`,
          });
          const retryNormalized = normalizeExtractProfile(retryParsed);
          const merged = normalizeExtractProfile({
            ...normalized,
            patient: {
              ...normalized.patient,
              name: normalized.patient.name && normalized.patient.name !== '未知' ? normalized.patient.name : retryNormalized.patient.name,
              age: normalized.patient.age && normalized.patient.age !== '未知' ? normalized.patient.age : retryNormalized.patient.age,
              bedNo: normalized.patient.bedNo && normalized.patient.bedNo !== '未知' ? normalized.patient.bedNo : retryNormalized.patient.bedNo,
              diagnosis:
                normalized.patient.diagnosis && normalized.patient.diagnosis !== '未知'
                  ? normalized.patient.diagnosis
                  : retryNormalized.patient.diagnosis,
              department:
                normalized.patient.department && normalized.patient.department !== '未知'
                  ? normalized.patient.department
                  : retryNormalized.patient.department,
              gender: normalizeGender(normalized.patient.gender || retryNormalized.patient.gender),
            },
          });
          candidates.push(merged);

          const mergedMissing = missingKeyFields(merged);
          if (mergedMissing.length < bestMissingCount) {
            best = merged;
            bestMissingCount = mergedMissing.length;
          }
          if (!mergedMissing.length) {
            await pool.query('UPDATE cases SET status=? WHERE id=?', ['extracted', caseId]);
            return res.json({ success: true, runId: null, profile: merged });
          }
          continue;
        }

        await pool.query('UPDATE cases SET status=? WHERE id=?', ['extracted', caseId]);
        return res.json({ success: true, runId: null, profile: normalized });
      }

      const mergedAcross = mergeExtractCandidates(candidates);
      const mergedAcrossMissing = missingKeyFields(mergedAcross);
      if (!mergedAcrossMissing.length) {
        await pool.query('UPDATE cases SET status=? WHERE id=?', ['extracted', caseId]);
        return res.json({ success: true, runId: null, profile: mergedAcross });
      }

      // All attempts still missing: return the best we got.
      await pool.query('UPDATE cases SET status=? WHERE id=?', ['extracted', caseId]);
      res.json({ success: true, runId: null, profile: best || normalizeExtractProfile({}) });
    } catch (e) {
      jsonError(res, 502, e.message || 'AI extract failed');
    }
  });

  // One-shot analyze: extract profile + generate plan in a single multimodal call (faster + fewer retries).
  app.post('/api/cases/:id/analyze', async (req, res) => {
    const caseId = Number(req.params.id);
    if (!caseId) return jsonError(res, 400, 'Invalid caseId');

    const pool = await getPool();
    const [files] = await pool.query('SELECT id, path, mime FROM case_files WHERE case_id=? ORDER BY id ASC', [caseId]);
    if (!files.length) return jsonError(res, 404, 'No files found for case');

    try {
      requiredEnv('DASHSCOPE_API_KEY');
    } catch {
      return jsonError(res, 503, 'AI key not configured on server');
    }

    // Use a single image for the main pass to reduce latency and timeouts.
    const orderedFiles = [files[0]];

    let bestProfile = null;
    let bestPlan = null;
    let bestMissingCount = Infinity;

    try {
      const imageDataUrls = await pickImageDataUrlsFromFiles(orderedFiles, orderedFiles.length);
      const parsed = await callVisionJson({ imageDataUrls, prompt: buildAnalyzePrompt(), requestTag: 'analyze_1' });

      const profilePart = parsed?.profile && typeof parsed.profile === 'object' ? parsed.profile : null;
      const planPart = parsed?.plan && typeof parsed.plan === 'object' ? parsed.plan : null;

      const normalizedProfile = normalizeExtractProfile(profilePart || parsed);
      const missing = missingKeyFields(normalizedProfile);

      bestMissingCount = missing.length;
      bestProfile = normalizedProfile;
      bestPlan = planPart ? clampPlan(planPart) : null;

      // Focused retry for missing fields with the smallest payload (second image only if provided).
      if (missing.length && files.length > 1) {
        const single = await pickImageDataUrlsFromFiles([files[1]], 1);
        const retryParsed = await callVisionJson({
          imageDataUrls: single,
          prompt: buildAnalyzePromptForMissing(missing),
          requestTag: 'analyze_retry_missing',
        });
        const retryProfilePart = retryParsed?.profile && typeof retryParsed.profile === 'object' ? retryParsed.profile : null;
        const retryPlanPart = retryParsed?.plan && typeof retryParsed.plan === 'object' ? retryParsed.plan : null;
        const retryProfile = normalizeExtractProfile(retryProfilePart || retryParsed);
        const retryMissing = missingKeyFields(retryProfile);
        if (retryMissing.length < bestMissingCount) {
          bestMissingCount = retryMissing.length;
          bestProfile = retryProfile;
          bestPlan = retryPlanPart ? clampPlan(retryPlanPart) : bestPlan;
        }
      }

      if (!bestProfile) bestProfile = normalizeExtractProfile({});
      if (!bestPlan) {
        // Rare fallback: if model didn't output plan, generate plan once based on bestProfile.
        const imageDataUrls = await pickImageDataUrls(files);
        const planRaw = await callVisionJson({ imageDataUrls, prompt: buildPlanPrompt(bestProfile), requestTag: 'plan_fallback' });
        bestPlan = clampPlan(planRaw);
      }

      await pool.query('UPDATE cases SET status=? WHERE id=?', ['analyzed', caseId]);
      res.json({ success: true, runId: null, profile: bestProfile, plan: bestPlan });
    } catch (e) {
      jsonError(res, 502, e.message || 'AI analyze failed');
    }
  });

  app.post('/api/cases/:id/plan', async (req, res) => {
    const caseId = Number(req.params.id);
    if (!caseId) return jsonError(res, 400, 'Invalid caseId');

    const profile = req.body?.profile;
    if (!profile || typeof profile !== 'object') return jsonError(res, 400, 'profile is required');

    const pool = await getPool();
    const [files] = await pool.query('SELECT id, path, mime FROM case_files WHERE case_id=? ORDER BY id ASC', [caseId]);
    if (!files.length) return jsonError(res, 404, 'No files found for case');

    const model = process.env.QWEN_MODEL || 'qwen3-vl-plus';
    try {
      requiredEnv('DASHSCOPE_API_KEY');
      const imageDataUrls = await pickImageDataUrls(files);
      const parsed = await callVisionJson({ imageDataUrls, prompt: buildPlanPrompt(profile), requestTag: 'plan' });
      const plan = clampPlan(parsed);
      await pool.query('UPDATE cases SET status=? WHERE id=?', ['planned', caseId]);
      res.json({ success: true, runId: null, plan });
    } catch (e) {
      jsonError(res, 502, e.message || 'AI plan failed');
    }
  });

  // 生成AI治疗日志
  app.post('/api/patients/:id/generate-log', async (req, res) => {
    const patientId = Number(req.params.id);
    if (!patientId) return jsonError(res, 400, 'Invalid patientId');

    const { patient, treatmentPlan, completedItems, previousLogs } = req.body;
    if (!patient || !treatmentPlan) return jsonError(res, 400, 'patient and treatmentPlan are required');

    try {
      requiredEnv('DASHSCOPE_API_KEY');

      const today = new Date();
      const date = today.toISOString().split('T')[0];

      const context = {
        patient,
        treatmentPlan,
        completedItems: completedItems || [],
        previousLogs: previousLogs || [],
        date
      };

      const prompt = buildLogPrompt(context);
      const { raw, text } = await callQwenVision({
        imageDataUrls: [],
        prompt,
        requestTag: 'generate-log'
      });

      const parsed = extractJsonFromText(text);

      // 添加日期和治疗师信息
      const log = {
        date,
        highlight: parsed.highlight || '常规康复训练',
        items: parsed.items || completedItems || [],
        cooperation: parsed.cooperation || '良好',
        tolerance: parsed.tolerance || '良好',
        notes: parsed.notes || '',
        safety: parsed.safety || treatmentPlan.precautions?.[0] || '注意观察患儿反应',
        therapist: '吴大勇'
      };

      res.json({ success: true, log });
    } catch (e) {
      console.error('AI generate log failed:', e);
      jsonError(res, 502, e.message || 'AI generate log failed');
    }
  });

  // ---------------- Patients (JSON blob) ----------------
  app.get('/api/patients', async (_req, res) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM patients ORDER BY id ASC');
      const items = rows.map((r) => {
        try {
          const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return { ...data, id: Number(r.id), createdAt: r.created_at, updatedAt: r.updated_at };
        } catch (parseError) {
          console.error(`Failed to parse patient ${r.id}:`, parseError);
          return { id: Number(r.id), name: 'Error', error: 'Invalid data', createdAt: r.created_at, updatedAt: r.updated_at };
        }
      });
      res.json({ success: true, items });
    } catch (error) {
      console.error('GET /api/patients error:', error);
      return jsonError(res, 500, 'Failed to fetch patients: ' + error.message);
    }
  });

  app.post('/api/patients', async (req, res) => {
    const patient = req.body?.patient;
    const plan = req.body?.plan || null;
    const caseId = req.body?.caseId ? Number(req.body.caseId) : null;
    if (!patient || typeof patient !== 'object') return jsonError(res, 400, 'patient is required');
    if (!patient.name) return jsonError(res, 400, 'patient.name is required');

    const payload = {
      ...patient,
      admissionDate: patient.admissionDate || toLocalIsoDate(),
    };

    const pool = await getPool();
    const [r] = await pool.query('INSERT INTO patients (data) VALUES (?)', [JSON.stringify(payload)]);
    const patientId = Number(r.insertId);
    if (plan && typeof plan === 'object') {
      await pool.query('INSERT INTO rehab_plans (patient_id, case_id, plan_json, confirmed) VALUES (?,?,?,?)', [
        patientId,
        caseId || null,
        JSON.stringify(plan),
        1,
      ]);
    }
    // 返回完整的患者数据，避免前端额外请求
    const createdPatient = { ...payload, id: patientId };
    res.status(201).json({ success: true, patientId, patient: createdPatient });
  });

  app.put('/api/patients/:id', async (req, res) => {
    const patientId = Number(req.params.id);
    if (!patientId) return jsonError(res, 400, 'Invalid patientId');
    const patient = req.body?.patient;
    if (!patient || typeof patient !== 'object') return jsonError(res, 400, 'patient is required');

    const pool = await getPool();
    const [[exists]] = await pool.query('SELECT id FROM patients WHERE id=?', [patientId]);
    if (!exists) return jsonError(res, 404, 'Patient not found');

    await pool.query('UPDATE patients SET data=? WHERE id=?', [JSON.stringify({ ...patient, id: patientId }), patientId]);
    res.json({ success: true });
  });

  app.delete('/api/patients/:id', async (req, res) => {
    const patientId = Number(req.params.id);
    if (!patientId) return jsonError(res, 400, 'Invalid patientId');
    const pool = await getPool();
    await pool.query('DELETE FROM patients WHERE id=?', [patientId]);
    res.status(204).end();
  });

  // Multer / JSON error handler
  app.use((err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return jsonError(res, 413, 'Image too large (max 15MB per file)');
      return jsonError(res, 400, err.message || 'Upload failed');
    }
    if (err) return jsonError(res, 500, err.message || 'Server error');
    next();
  });

  // Global error handler - must be last middleware
  app.use((err, req, res, next) => {
    // Log error details
    const timestamp = new Date().toISOString();
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    console.error(`[ERROR] ${timestamp} [ID: ${errorId}]`);
    console.error(`Path: ${req.method} ${req.path}`);
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);

    // Different error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
        errorId
      });
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        details: err.message,
        errorId
      });
    }

    if (err.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
        details: err.message,
        errorId
      });
    }

    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        details: 'Database connection failed',
        errorId
      });
    }

    // Default server error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
      errorId,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  });

  // 404 handler - must be after all routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
      path: req.path,
      method: req.method
    });
  });

  return app;
}

async function main() {
  const port = Number(process.env.PORT || 3201);
  fs.mkdirSync(uploadDir(), { recursive: true });
  await migrate();
  await seedIfEmpty();
  const app = createApp();

  // Graceful shutdown handler
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`AI server listening on http://0.0.0.0:${port}`);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    console.error(err.stack);
    // Log to file or monitoring service here
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Promise Rejection at:', promise);
    console.error('Reason:', reason);
    // Log to file or monitoring service here
  });

  // Graceful shutdown on SIGTERM (e.g., from PM2)
  process.on('SIGTERM', () => {
    console.log('[INFO] SIGTERM received, starting graceful shutdown...');
    server.close(() => {
      console.log('[INFO] HTTP server closed');
      // Close database connections, etc.
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('[ERROR] Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  });

  // Graceful shutdown on SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('[INFO] SIGINT received, starting graceful shutdown...');
    server.close(() => {
      console.log('[INFO] HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[ERROR] Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  });
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { createApp };
