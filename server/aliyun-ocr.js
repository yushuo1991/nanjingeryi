const crypto = require('crypto');
const https = require('https');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function generateSignature(method, params, accessKeySecret) {
  const sortedKeys = Object.keys(params).sort();
  const canonicalizedQueryString = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const stringToSign = `${method}&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`;
  const hmac = crypto.createHmac('sha1', `${accessKeySecret}&`);
  hmac.update(stringToSign);
  return hmac.digest('base64');
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function stripDataUrlPrefix(image) {
  return image.replace(/^data:image\/\w+;base64,/, '');
}

async function recognizeAdvanced(imageDataUrlOrBase64) {
  const accessKeyId = requireEnv('ALIYUN_ACCESS_KEY_ID');
  const accessKeySecret = requireEnv('ALIYUN_ACCESS_KEY_SECRET');

  const base64Data = stripDataUrlPrefix(imageDataUrlOrBase64);
  const postData = base64Data;
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const nonce = uuid();

  const params = {
    AccessKeyId: accessKeyId,
    Action: 'RecognizeAdvanced',
    Format: 'JSON',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: nonce,
    SignatureVersion: '1.0',
    Timestamp: timestamp,
    Version: '2021-07-07',
    OutputCharInfo: 'false',
    OutputTable: 'false',
    NeedRotate: 'true',
  };

  params.Signature = generateSignature('POST', params, accessKeySecret);

  const queryString = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const options = {
    hostname: 'ocr-api.cn-hangzhou.aliyuncs.com',
    port: 443,
    path: `/?${queryString}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': Buffer.byteLength(postData, 'base64'),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse OCR response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(Buffer.from(postData, 'base64'));
    req.end();
  });
}

module.exports = { recognizeAdvanced };

