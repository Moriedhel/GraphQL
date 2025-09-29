import { signIn, parseJwt, setToken } from '../auth.js';
import { PROXY_INFO } from '../config.js';

export function mountLoginView(root, onSuccess) {
  root.innerHTML = '';

  const form = document.createElement('form');
  form.autocomplete = 'on';
  form.innerHTML = `
    <label for="login">Username or Email</label>
    <input id="login" name="login" type="text" required autocomplete="username"/>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" required autocomplete="current-password"/>

    <label class="remember"><input id="remember" type="checkbox"/> Remember me</label>

    <button type="submit">Login</button>
    <p id="error" class="error" aria-live="polite"></p>
  `;

  if (PROXY_INFO.usingPublicProxy) {
    const warn = document.createElement('p');
    warn.className = 'error';
    warn.textContent = 'Notice: Using a public CORS proxy (corsproxy.io). Authorization headers may be blocked. If login fails, paste a JWT below or use a private proxy (Vercel/Render).';
    root.appendChild(warn);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = form.querySelector('#login').value.trim();
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('#remember').checked;
    const btn = form.querySelector('button');
    const err = form.querySelector('#error');
    err.textContent = '';
    btn.disabled = true;
    try {
      await signIn(login, password, remember);
      onSuccess?.();
    } catch (ex) {
      if (ex && ex.message === 'CORS_OR_NETWORK') {
        err.textContent = 'Login request was blocked by the browser (CORS or network). If you are testing on a deployed domain, this indicates the API CORS headers are misconfigured. Try running locally on http://localhost or contact the platform admin to fix CORS.';
      } else if (ex && ex.message === 'INVALID_JWT_RESPONSE') {
        err.textContent = 'Login response did not contain a valid JWT (proxy may have altered it). Try the manual JWT option below or a private proxy.';
      } else {
        err.textContent = 'Invalid credentials or network error.';
      }
    }
    btn.disabled = false;
  });

  root.appendChild(form);

  // Manual JWT fallback
  const manual = document.createElement('details');
  manual.innerHTML = `
    <summary>Use an existing JWT token instead</summary>
    <div style="margin-top:0.5rem">
      <label for="jwtInput">JWT</label>
      <textarea id="jwtInput" rows="3" style="width:100%" placeholder="Paste your JWT here..."></textarea>
      <button id="useJwtBtn" type="button">Use token</button>
      <p id="jwtErr" class="error" aria-live="polite"></p>
    </div>
  `;
  manual.querySelector('#useJwtBtn').addEventListener('click', () => {
    const token = manual.querySelector('#jwtInput').value.trim();
    const err = manual.querySelector('#jwtErr');
    err.textContent = '';
    if (!token) { err.textContent = 'Please paste a token.'; return; }
    const payload = parseJwt(token);
    if (!payload || !payload.sub) { err.textContent = 'That does not look like a valid JWT.'; return; }
    setToken(token, false);
    onSuccess?.();
  });
  root.appendChild(manual);
}
