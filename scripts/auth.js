// Authentication utilities: sign in, sign out, token storage, JWT parsing
// Security: no logging of secrets; memory-first storage; explicit opt-in for persistence

const STORAGE_KEYS = {
  token: 'z01.jwt',
  remember: 'z01.remember',
};

let inMemoryToken = null;

function base64UrlDecode(input) {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/');
  const str = atob(base64);
  try {
    return decodeURIComponent(
      str
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return str;
  }
}

export function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}

export async function signIn(loginOrEmail, password, remember = false) {
  // Basic auth with base64(login:password)
  const credentials = btoa(`${loginOrEmail}:${password}`);
  let res;
  try {
    const { AUTH_ENDPOINT } = await import('./config.js');
    res = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
  } catch (networkErr) {
    const e = new Error('CORS_OR_NETWORK');
    e.cause = networkErr;
    throw e;
  }

  if (!res.ok) {
    let errText = '';
    try { errText = await res.text(); } catch {}
    const e = new Error(errText || 'Invalid credentials');
    e.status = res.status;
    throw e;
  }

  const token = await res.text();
  setToken(token, remember);
  return token;
}

export function setToken(token, remember = false) {
  inMemoryToken = token || null;
  sessionStorage.setItem(STORAGE_KEYS.token, token || '');
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.remember, '1');
    localStorage.setItem(STORAGE_KEYS.token, token || '');
  } else {
    localStorage.removeItem(STORAGE_KEYS.remember);
    localStorage.removeItem(STORAGE_KEYS.token);
  }
}

export function getToken() {
  if (inMemoryToken) return inMemoryToken;
  // Prefer sessionStorage
  const sessionTok = sessionStorage.getItem(STORAGE_KEYS.token);
  if (sessionTok) {
    inMemoryToken = sessionTok;
    return inMemoryToken;
  }
  // Optional localStorage
  if (localStorage.getItem(STORAGE_KEYS.remember) === '1') {
    const tok = localStorage.getItem(STORAGE_KEYS.token);
    inMemoryToken = tok;
    return tok;
  }
  return null;
}

export function signOut() {
  inMemoryToken = null;
  sessionStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.remember);
  // Hard reload to pristine state
  location.reload();
}
