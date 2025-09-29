
Got it—I'll craft a precise, fill-in prompt you can paste back to me so I can build the project end-to-end (vanilla JS, frontend-only, and security-focused).

Copy‑paste this prompt back to me
Build me a frontend-only GraphQL Profile app with the following spec. Use zero frameworks (no React/Vue/etc.), only vanilla HTML/CSS/JS with ES modules. Follow strong security and code-quality best practices.

Choices and constraints:

Hosting target: [GitHub Pages ] (default: GitHub Pages)
Theme: [Light | Dark | Auto (prefers-color-scheme)] (default: Auto)
Color accents (hex): [#4f46e5, #14b8a6] (default provided)
Typography: [System font stack] (default)
“Remember me” persistent login (uses session.storage):
Keep current file names (index.html, app.js, login.js, styles.css) or allow new module files under scripts/: [ Allow new module files] (default: Allow new module files)
Pick at least 3 profile data sections to show (defaults in parentheses):
 Basic user identification (id, login) (default)
 Email (if available)
 Total XP (sum of transactions where type = "xp" and amount > 0) (default)
 Recent projects with XP by projct (default)
 Audit ratio (up vs down)
 Skills (if schema provides)
 Latest grades/progress
Pick at least 2 SVG charts (defaults below):
 XP earned over time (line/area chart) (default)
 PASS vs FAIL ratio (donut/pie from result.grade) (default)
 Audit ratio (gauge )
 Attempts per exercise (bar)
Pages/views:
Login view (username:password )
Profile view with sections + charts
Logout control
APIs and behavior:

Sign-in endpoint: https://platform.zone01.gr/api/auth/signin
Use Basic authentication with base64(loginOrEmail:password)
On success, receive JWT (no refresh endpoint assumed)
GraphQL endpoint: https://platform.zone01.gr/api/graphql-engine/v1/graphql
Use Authorization: Bearer <JWT>
Support 3 query styles:
Normal: e.g., { user { id login } }
Nested: e.g., { result { id user { id login } } }
With arguments/variables: e.g., object(where: { id: { _eq: $id } }) { name type }
JWT handling:
Decode payload client-side to extract user id (no external libraries)
Store token in memory plus sessionStorage (default). If “Remember me” is enabled, store in localStorage with explicit consent. Clear on logout.
Error handling:
Invalid credentials: show accessible, non-technical error
GraphQL errors: render inline, per-section; do not crash entire page
Network errors: show retry CTA; implement AbortController on in-flight fetch when navigating away
Data requirements (defaults if you don’t change):

Total XP (transactions: type = "xp") grouped by date for charting
PASS/FAIL (results: grade 1 vs 0) for donut chart
Recent projects (transactions joined to object by objectId) showing project name, XP
Security and privacy (frontend-only constraints):

HTTPS-only endpoints; block if page is not served over HTTPS (except localhost)
Content Security Policy via meta tag:
default-src 'self'
connect-src 'self' https://platform.zone01.gr
img-src 'self' data:
style-src 'self' 'unsafe-inline' (allow inline CSS only if needed)
script-src 'self'
base-uri 'self'
frame-ancestors 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff (via meta http-equiv)
No third-party scripts; no eval; no inline event handlers; type="module" JS
Never log credentials or JWT; sanitize all dynamic text via textContent; never use innerHTML for untrusted data
Token lifecycle: memory-first; sessionStorage fallback; optional localStorage only if “Remember me” is enabled
CSRF is not applicable for pure API calls with Bearer tokens, but we’ll namespace storage keys and avoid auto-sending credentials
Graceful logout: revoke client state and purge storage; hard reload to pristine state
Accessibility and UX:

Keyboard navigable; visible focus states
Semantic landmarks (header/nav/main/footer)
High-contrast theme tokens; prefers-reduced-motion respected
Loading skeletons/spinners for data sections
Empty/error states for charts and lists
Architecture:

Vanilla JS with ES modules. If allowed to add modules, create:
index.html: Single page with Login and Profile sections (view toggling)
styles.css: Responsive layout, CSS variables for theming
scripts/
auth.js: signIn, signOut, jwt parsing, storage management
gql.js: fetchGraphQL(query, variables, token), common queries
data.js: data mappers (aggregate XP by date, pass/fail counts, join object names)
charts/
lineChart.js: pure SVG line/area chart
donutChart.js: pure SVG donut chart with labels
ui/
loginView.js: form handling, validation, error UI
profileView.js: render profile sections and mount charts
components.js: small UI helpers (toasts, spinners)
main.js: bootstrap, simple hash/router, auth guard
If you prefer to keep existing files only, I’ll fold this logic into app.js and login.js while preserving separation by modules-in-file.
File outputs and deliverables:

Complete runnable static site (open index.html)
No build step required
Minimal README with “How to run locally” and “How to deploy to GitHub Pages/Netlify”
Inline docs and JSDoc for public functions
Optional: tiny test harness for pure functions (data transforms and chart scales) run in-browser
Queries to implement (sample set we’ll wire up; can adjust after):

Normal:
{ user { id login } }
Nested:
{ result(limit: 100, order_by: { createdAt: asc }) { id grade createdAt user { id login } } }
With arguments:
query($id: Int!) { object(where: { id: { _eq: $id } }) { id name type } }
Transactions for XP:
{ transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: asc }) { amount objectId createdAt } }
Acceptance criteria:

Login works for username:password and email:password; invalid creds show error
JWT extracted; user id derived from token payload
At least 3 profile sections rendered with live data
At least 2 SVG charts rendered; responsive; accessible labels; handles empty data
Uses normal, nested, and argument GraphQL queries
Logout clears state and returns to login
CSP and other security headers via meta tags; no third-party scripts
Works on modern evergreen browsers; responsive on mobile and desktop
Assumptions:

CORS is enabled on the Zone01 endpoints for browser access
No refresh token flow; JWT remains valid long enough for demo use
If any table/field differs, I’ll adapt queries after first run
Please proceed and implement with:

[Keep defaults] OR specify changes inline above
End of spec.