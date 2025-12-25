export async function handler(event) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return {
      statusCode: 500,
      body: 'BACKEND_URL is not configured',
    };
  }

  const path = event.path.replace('/api', '');
  const url = `${backendUrl}${path}`;

  const response = await fetch(url, {
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
      ...event.headers,
    },
    body: event.body,
  });

  const data = await response.text();

  return {
    statusCode: response.status,
    body: data,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  };
}
