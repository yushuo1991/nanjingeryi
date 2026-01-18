const rawBase = import.meta.env.VITE_API_BASE || '';
const API_BASE = rawBase.replace(/\/$/, '');

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
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await parseJsonSafely(response);
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (path.startsWith('/api') && response.ok && contentType.includes('text/html')) {
    const error = new Error('API 返回了 HTML（很可能是 Nginx 未把 /api 反代到后端 Node 服务）');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      `Request failed: ${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getErrorMessage(error) {
  if (!error) return '未知错误';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return '操作失败';
}
