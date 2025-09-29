// Tiny CORS proxy for local development only.
// - Forwards /api/auth/signin and /api/graphql to the Zone01 platform
// - Sets correct CORS headers for browser requests from http://localhost
// Usage: node proxy-server.js (or add an npm script)

const http = require('http');
const https = require('https');
const { URL } = require('url');

const TARGETS = {
  '/api/auth/signin': 'https://platform.zone01.gr/api/auth/signin',
  '/api/graphql': 'https://platform.zone01.gr/api/graphql-engine/v1/graphql',
};

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  const target = TARGETS[req.url];
  if (!target) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }

  const targetUrl = new URL(target);
  const isAuth = req.url === '/api/auth/signin';

  // Build request options
  const options = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port || 443,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.hostname,
      origin: targetUrl.origin,
      referer: targetUrl.origin,
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Forward status and most headers
    const headers = { ...proxyRes.headers };

    // Fix CORS headers for the browser
    headers['access-control-allow-origin'] = origin || '*';
    headers['access-control-allow-headers'] = req.headers['access-control-request-headers'] || 'authorization, content-type';
    headers['access-control-allow-methods'] = 'GET, POST, OPTIONS';
    headers['access-control-expose-headers'] = 'content-type';

    // Avoid duplicated ACAO headers by removing any duplicates
    delete headers['access-control-allow-origin']; // delete all then set a single one
    headers['Access-Control-Allow-Origin'] = origin || '*';

    res.writeHead(proxyRes.statusCode || 500, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': origin || '*' });
    res.end('Proxy error: ' + err.message);
  });

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight quickly
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || 'authorization, content-type',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  req.pipe(proxyReq);
});

const PORT = process.env.PORT || 8787;
server.listen(PORT, () => {
  console.log(`Local proxy listening on http://localhost:${PORT}`);
  console.log('Forwarding:');
  console.log('  /api/auth/signin -> https://platform.zone01.gr/api/auth/signin');
  console.log('  /api/graphql     -> https://platform.zone01.gr/api/graphql-engine/v1/graphql');
});
