import { getToken, signOut } from './auth.js';
import { mountLoginView } from './ui/loginView.js';
import { mountProfileView } from './ui/profileView.js';

function ensureHttpsOrLocalhost() {
  const isLocalHttp = location.protocol === 'http:' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (location.protocol === 'http:' && !isLocalHttp) {
    document.body.innerHTML = '<main><h1>HTTPS required</h1><p>Please use HTTPS to protect your data.</p></main>';
    throw new Error('Insecure context');
  }
}

async function start() {
  ensureHttpsOrLocalhost();

  const app = document.getElementById('app');
  const render = () => {
    app.innerHTML = '';
    if (!getToken()) {
      mountLoginView(app, () => render());
    } else {
      const ac = new AbortController();
      app.addEventListener('logout', () => signOut());
      mountProfileView(app, ac);
    }
  };
  render();
}

window.addEventListener('DOMContentLoaded', start);
