import { signIn } from '../auth.js';

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
      } else {
        err.textContent = 'Invalid credentials or network error.';
      }
    }
    btn.disabled = false;
  });

  root.appendChild(form);
}
