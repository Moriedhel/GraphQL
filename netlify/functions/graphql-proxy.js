// Netlify Function: graphql-proxy
// Forwards POST /api/graphql to Zone01 GraphQL and fixes CORS.

const https = require('https');

exports.handler = async function(event, context) {
  const origin = event.headers.origin || '*';
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(origin, event.headers['access-control-request-headers']),
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(origin), body: 'Method Not Allowed' };
  }

  const resBody = await forwardRequest('https://platform.zone01.gr/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: filterHeaders(event.headers),
    body: event.body,
    isBase64Encoded: event.isBase64Encoded,
  });

  return {
    statusCode: resBody.statusCode,
    headers: { ...resBody.headers, ...corsHeaders(origin) },
    body: resBody.body,
    isBase64Encoded: resBody.isBase64Encoded,
  };
};

function corsHeaders(origin, reqHeaders) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': reqHeaders || 'authorization, content-type',
    'Access-Control-Expose-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function filterHeaders(h) {
  const copy = { ...h };
  delete copy['host'];
  if (copy.authorization) copy['Authorization'] = copy.authorization;
  if (copy['content-type']) copy['Content-Type'] = copy['content-type'];
  return {
    Authorization: copy['Authorization'],
    'Content-Type': copy['Content-Type'] || 'application/json',
    Origin: 'https://platform.zone01.gr',
    Referer: 'https://platform.zone01.gr',
  };
}

function forwardRequest(url, { method, headers, body, isBase64Encoded }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode || 500,
          headers: sanitizeHeaders(res.headers),
          body: buf.toString('base64'),
          isBase64Encoded: true,
        });
      });
    });
    req.on('error', reject);

    if (body) {
      const data = isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body);
      req.write(data);
    }
    req.end();
  });
}

function sanitizeHeaders(h) {
  const headers = { ...h };
  delete headers['access-control-allow-origin'];
  delete headers['Access-Control-Allow-Origin'];
  return headers;
}
