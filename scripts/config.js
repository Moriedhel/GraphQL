// Runtime config for API endpoints
// Priority:
// 1) If on localhost/127.0.0.1/::1 -> use local proxy endpoints
// 2) Else if REMOTE_PROXY_BASE is set -> use remote proxy
// 3) Else -> direct platform endpoints

const IS_LOCALHOST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

// Set this to your deployed proxy base (e.g., https://your-proxy.workers.dev)
const REMOTE_PROXY_BASE = '';

const USE_LOCAL_PROXY = IS_LOCALHOST;
const USE_REMOTE_PROXY = !IS_LOCALHOST && typeof REMOTE_PROXY_BASE === 'string' && REMOTE_PROXY_BASE.length > 0;

export const AUTH_ENDPOINT = USE_LOCAL_PROXY
  ? '/api/auth/signin'
  : USE_REMOTE_PROXY
    ? `${REMOTE_PROXY_BASE}/api/auth/signin`
    : 'https://platform.zone01.gr/api/auth/signin';

export const GQL_ENDPOINT = USE_LOCAL_PROXY
  ? '/api/graphql'
  : USE_REMOTE_PROXY
    ? `${REMOTE_PROXY_BASE}/api/graphql`
    : 'https://platform.zone01.gr/api/graphql-engine/v1/graphql';
