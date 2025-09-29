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

## Deploy

### GitHub Pages

1. Commit and push this folder to your repo (e.g., main branch).
2. In GitHub, Settings → Pages → Build and deployment: select `Deploy from a branch`, branch `main`, folder `/root`.
3. After publishing, open the Pages URL. It will be served over HTTPS.

### Netlify

1. Drag-and-drop the folder on app.netlify.com or connect your Git repo.
2. Publish directory is the repo root.
3. Deploy; the site URL will be HTTPS automatically.

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