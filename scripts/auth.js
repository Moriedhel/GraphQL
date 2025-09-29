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

function base64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function signIn(loginOrEmail, password, remember = false) {
  // Basic auth with UTF-8 safe base64(login:password)
  const credentials = base64Utf8(`${loginOrEmail}:${password}`);
  let res;
  try {
    const { AUTH_ENDPOINT, PROXY_INFO } = await import('./config.js');
    const headers = {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'text/plain',
    };
    if (PROXY_INFO.usingPublicProxy) {
      headers['x-cors-headers'] = 'authorization,content-type';
    }
    res = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers,
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

  let raw = await res.text();
  let token = raw.trim();

  // Some proxies may wrap the token in quotes or JSON; try to extract a JWT
  const jwtRe = /([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/;

  // If the entire response is a quoted string
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    try { token = JSON.parse(token); } catch {}
  }

  // If it's JSON object, try to find a JWT in values
  if (token.startsWith('{') && token.endsWith('}')) {
    try {
      const obj = JSON.parse(token);
      for (const v of Object.values(obj)) {
        if (typeof v === 'string' && jwtRe.test(v)) { token = v; break; }
      }
    } catch {}
  }

  // If still not a JWT, attempt regex match within the text
  if (!jwtRe.test(token)) {
    const m = raw.match(jwtRe);
    if (m) token = m[1];
  }

  // Final validation
  if (!jwtRe.test(token)) {
    const e = new Error('INVALID_JWT_RESPONSE');
    throw e;
  }
  // Ensure it base64url decodes (parseJwt returns null on failure)
  const payload = parseJwt(token);
  if (!payload) {
    // try URL-decoding then re-parse once
    try {
      const dec = decodeURIComponent(token);
      if (jwtRe.test(dec) && parseJwt(dec)) {
        token = dec;
      } else {
        throw new Error('INVALID_JWT_RESPONSE');
      }
    } catch {
      const e = new Error('INVALID_JWT_RESPONSE');
      throw e;
    }
  }

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
