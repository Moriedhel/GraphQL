# Zone01 GraphQL Profile (Frontend-only)

A secure, framework-free profile page that logs in to Zone01, fetches your data via GraphQL, and renders SVG charts (XP over time and Pass/Fail ratio).

## Features

- Vanilla HTML/CSS/JS with ES modules (no frameworks)
- Login using username or email + password (Basic Auth to get JWT)
- JWT stored in memory + sessionStorage; optional “Remember me” uses localStorage
- GraphQL queries (normal, nested, and with variables)
- Sections: Basic info, Total XP, Recent projects, Charts (line + donut)
- Strong client-side security: CSP, no inline handlers, no third-party scripts
- Accessible UI (semantic structure, focus states, reduced motion friendly)

## Run locally

You must serve over:
- https on a domain, or
- http://localhost for local development.

Open `index.html` with a static server. Examples:

PowerShell (Node):

```powershell
npx http-server . -p 5173
```

PowerShell (Python 3):

```powershell
python -m http.server 5173
```

Then open http://localhost:5173 in your browser.

Notes:
- The app blocks non-HTTPS origins except `localhost`.
- Ensure your browser allows requests to https://platform.zone01.gr.

### Use local CORS proxy (when API CORS is broken)

Run the proxy and static server together (requires Node):

```powershell
npm install
npm run dev
```

This will start:
- Proxy on http://localhost:8787 forwarding /api/auth/signin and /api/graphql
- Static server on http://localhost:5173

The frontend will automatically target the proxy when running on localhost.

## Deploy

### GitHub Pages

1. Commit and push this folder to your repo (e.g., main branch).
2. In GitHub, Settings → Pages → Build and deployment: select `Deploy from a branch`, branch `main`, folder `/root`.
3. After publishing, open the Pages URL. It will be served over HTTPS.

### Netlify

1. Drag-and-drop the folder on app.netlify.com or connect your Git repo.
2. Publish directory is the repo root.
3. Deploy; the site URL will be HTTPS automatically.

If you want a hosted proxy without Cloudflare Workers, use Netlify Functions (included):

1. Keep `netlify.toml` and the `netlify/functions/*-proxy.js` files committed.
2. Deploy to Netlify (connect repo). Netlify will host the functions at `/.netlify/functions/*`.
3. The provided redirects map `/api/auth/signin` and `/api/graphql` to the functions.
4. In `scripts/config.js`, set `REMOTE_PROXY_BASE` to your site origin (e.g., `https://your-site.netlify.app`).
5. Redeploy; the frontend will call `https://your-site.netlify.app/api/...` which routes to the functions and then to the Zone01 API with corrected CORS.

### Remote CORS proxy (Cloudflare Workers)

If the Zone01 API CORS headers are invalid on your deployed domain, deploy a small proxy:

1. Create a new Worker and paste `proxy-cloudflare-worker.js`.
2. Deploy and note the URL, e.g., `https://your-proxy.workers.dev`.
3. Edit `scripts/config.js` and set `REMOTE_PROXY_BASE` to that URL.
4. Commit and redeploy your static site (GitHub Pages/Netlify).

The app will then call `${REMOTE_PROXY_BASE}/api/auth/signin` and `${REMOTE_PROXY_BASE}/api/graphql` instead of the platform directly, and the Worker will return correct CORS headers.

## Project structure

- `index.html` — single-page shell, security meta tags, mounts the app
- `styles.css` — responsive styles with CSS variables
- `scripts/`
  - `main.js` — bootstrap, HTTPS guard, view switching
  - `auth.js` — signIn/signOut, storage, JWT parsing
  - `gql.js` — fetchGraphQL and common queries
  - `data.js` — pure mappers (XP grouping, pass/fail)
  - `charts/lineChart.js` — SVG line/area chart
  - `charts/donutChart.js` — SVG donut chart
  - `ui/loginView.js` — login form and validation
  - `ui/profileView.js` — renders sections and charts
- `login.js` — thin re-export for backward compatibility
- `app.js` — unused (frontend-only), kept as a placeholder

## Security checklist

- CSP: restricts sources to self and Zone01 API
- No third-party scripts, no eval, no inline event handlers
- Never logs credentials/JWT; dynamic text uses `textContent`
- Token lifecycle: memory + sessionStorage; optional localStorage only when opted in
- Logout clears all storage and reloads

## Troubleshooting

- Invalid credentials → check username/email and password; ensure HTTPS or localhost
- Network error → check CORS and that the Zone01 API is reachable
- Blank charts → may indicate empty data; ensure your account has transactions/results

## License

MIT (or your preferred license).