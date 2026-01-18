async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api(path, options = {}) {
  const response = await fetch(path, options);
  const data = await parseJsonSafely(response);
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (path.startsWith('/api') && response.ok && contentType.includes('text/html')) {
    throw new Error('API 返回了 HTML（Nginx 未正确反代 /api 到后端服务）');
  }

  if (!response.ok) {
    const msg =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      `Request failed: ${response.status} ${response.statusText}`;
    const err = new Error(msg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

