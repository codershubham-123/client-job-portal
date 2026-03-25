const FORWARDED_HEADERS = ['accept', 'authorization', 'content-type'];

function buildBackendUrl(backendUrl, event) {
  const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  const incomingPath = event.path || '';
  const normalizedPath = incomingPath.replace(/^\/api(?=\/|$)/, '') || '/';

  const query =
    event.rawQuery ||
    event.rawQueryString ||
    (event.queryStringParameters
      ? new URLSearchParams(event.queryStringParameters).toString()
      : '');

  return `${baseUrl}${normalizedPath}${query ? `?${query}` : ''}`;
}

function buildCorsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '*';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept',
    Vary: 'Origin',
  };
}

export async function handler(event) {
  const backendUrl = process.env.BACKEND_URL;
  const corsHeaders = buildCorsHeaders(event);

  if (!backendUrl) {
    return {
      statusCode: 500,
      body: 'BACKEND_URL is not configured',
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      },
    };
  }

  if ((event.httpMethod || '').toUpperCase() === 'OPTIONS') {
    return {
      statusCode: 204,
      body: '',
      headers: corsHeaders,
    };
  }

  const method = (event.httpMethod || 'GET').toUpperCase();
  const url = buildBackendUrl(backendUrl, event);

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

  try {
    const response = await fetch(url, requestInit);
    const data = await response.text();

    return {
      statusCode: response.status,
      body: data,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        message: 'Failed to reach backend API',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    };
  }
}
