export async function handler(event) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return {
      statusCode: 500,
      body: 'BACKEND_URL is not configured',
    };
  }

  const url = `${backendUrl}${event.path}`;

  const options = {
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    options.body = event.body;
  }

  const response = await fetch(url, options);
  const data = await response.text();

  return {
    statusCode: response.status,
    body: data,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  };
}
