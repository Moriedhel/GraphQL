// Cloudflare Workers proxy (deploy to Workers, set the URL in scripts/config.js REMOTE_PROXY_BASE)
// Forwards /api/auth/signin and /api/graphql to the Zone01 API and normalizes CORS.
// Usage:
// 1) Copy this code into a new Worker (dashboard or wrangler)
// 2) Set REMOTE_PROXY_BASE in scripts/config.js to the Worker URL, e.g. https://your-proxy.workers.dev
// 3) Deploy your static site (e.g., GitHub Pages). The frontend will route via the worker.

const MAP = {
  '/api/auth/signin': 'https://platform.zone01.gr/api/auth/signin',
  '/api/graphql': 'https://platform.zone01.gr/api/graphql-engine/v1/graphql',
};

function corsHeaders(origin) {
  const o = origin || '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,content-type',
    'Access-Control-Expose-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = MAP[url.pathname];
    const origin = request.headers.get('Origin') || '*';

    if (!target) {
      return new Response('Not found', { status: 404, headers: corsHeaders(origin) });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const init = {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
    };

    // Normalize upstream headers which might duplicate ACAO
    init.headers.delete('host');
    init.headers.set('origin', new URL(target).origin);
    init.headers.set('referer', new URL(target).origin);

    let resp;
    try {
      resp = await fetch(target, init);
    } catch (e) {
      return new Response('Upstream error', { status: 502, headers: corsHeaders(origin) });
    }

    const responseHeaders = new Headers(resp.headers);
    // Remove conflicting ACAO and set a single one
    responseHeaders.delete('Access-Control-Allow-Origin');
    const body = await resp.arrayBuffer();

    return new Response(body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: new Headers({
        ...Object.fromEntries(responseHeaders.entries()),
        ...corsHeaders(origin),
      }),
    });
  }
};
