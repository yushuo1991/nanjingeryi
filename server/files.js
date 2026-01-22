const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function uploadDir() {
  return process.env.UPLOAD_DIR || '/var/www/rehab-care-link/uploads';
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const buf = fs.readFileSync(filePath);
  hash.update(buf);
  return hash.digest('hex');
}

function extFromMime(mime) {
  if (!mime) return '';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  return '';
}

function buildStoredPath(originalName, mime) {
  const dir = uploadDir();
  ensureDir(dir);
  const base = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const ext = path.extname(originalName || '') || extFromMime(mime);
  return path.join(dir, `${base}${ext}`);
}

module.exports = { uploadDir, sha256File, buildStoredPath };

