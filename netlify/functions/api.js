const FORWARDED_HEADERS = ['accept', 'authorization', 'content-type'];

export async function handler(event) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return {
      statusCode: 500,
      body: 'BACKEND_URL is not configured',
    };
  }

  const method = (event.httpMethod || 'GET').toUpperCase();
  const url = `${backendUrl}${event.path}`;

  const headers = new Headers();

  for (const [key, value] of Object.entries(event.headers || {})) {
    const lowerKey = key.toLowerCase();

    if (value && FORWARDED_HEADERS.includes(lowerKey)) {
      headers.set(lowerKey, value);
    }
  }

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  const requestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD' && event.body != null) {
    requestInit.body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;
  }

  const response = await fetch(url, requestInit);
  const data = await response.text();

  return {
    statusCode: response.status,
    body: data,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  };
}
