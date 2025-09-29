// Runtime config for API endpoints
// Priority:
// 1) If on localhost/127.0.0.1/::1 -> use local proxy endpoints (if present)
// 2) Else if REMOTE_PROXY_BASE is set -> use remote proxy
// 3) Else if ENABLE_PUBLIC_CORS_PROXY -> use corsproxy.io
// 4) Else -> direct platform endpoints

const IS_LOCALHOST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

// Set this to your deployed proxy base (e.g., https://your-proxy.vercel.app or https://your-proxy.onrender.com)
const REMOTE_PROXY_BASE = '';

// WARNING: Using a public CORS proxy will route your credentials and JWT through a third party.
// Enable only if you accept the risk for demo purposes.
const ENABLE_PUBLIC_CORS_PROXY = true;
const PUBLIC_CORS_PROXY = 'https://corsproxy.io/';

const PLATFORM_AUTH = 'https://platform.zone01.gr/api/auth/signin';
const PLATFORM_GQL = 'https://platform.zone01.gr/api/graphql-engine/v1/graphql';

const USE_LOCAL_PROXY = IS_LOCALHOST;
const USE_REMOTE_PROXY = !IS_LOCALHOST && typeof REMOTE_PROXY_BASE === 'string' && REMOTE_PROXY_BASE.length > 0;
const USE_PUBLIC_PROXY = !IS_LOCALHOST && !USE_REMOTE_PROXY && ENABLE_PUBLIC_CORS_PROXY;

export const AUTH_ENDPOINT = USE_LOCAL_PROXY
  ? '/api/auth/signin'
  : USE_REMOTE_PROXY
    ? `${REMOTE_PROXY_BASE}/api/auth/signin`
    : USE_PUBLIC_PROXY
      ? `${PUBLIC_CORS_PROXY}?url=${encodeURIComponent(PLATFORM_AUTH)}`
      : PLATFORM_AUTH;

export const GQL_ENDPOINT = USE_LOCAL_PROXY
  ? '/api/graphql'
  : USE_REMOTE_PROXY
    ? `${REMOTE_PROXY_BASE}/api/graphql`
    : USE_PUBLIC_PROXY
      ? `${PUBLIC_CORS_PROXY}?url=${encodeURIComponent(PLATFORM_GQL)}`
      : PLATFORM_GQL;

export const PROXY_INFO = {
  isLocalhost: IS_LOCALHOST,
  remoteProxyBase: REMOTE_PROXY_BASE,
  usingLocalProxy: USE_LOCAL_PROXY,
  usingRemoteProxy: USE_REMOTE_PROXY,
  usingPublicProxy: USE_PUBLIC_PROXY,
};
