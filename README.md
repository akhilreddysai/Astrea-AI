# Astrea — ERCOT Operations Desk

Password-gated demonstration site. Static dashboard behind a Vercel Edge Middleware
auth gate, so the dashboard HTML is never sent to an unauthenticated browser.

```
.
├── login.html        public — branded sign-in page
├── index.html        the ERCOT desk (protected)
├── middleware.js     Edge Middleware — guards every path except /login
├── api/
│   ├── _auth.js      shared HMAC / cookie helpers (not routable)
│   ├── login.js      POST password → sets a signed HttpOnly session cookie
│   └── logout.js     clears the cookie
├── vercel.json
├── .env.example
└── .gitignore
```

## Deploy from Git

1. Push this folder to a repository. Keep the files at the **repository root**, not in a
   subfolder (or set Vercel's Root Directory to that subfolder).
2. In Vercel, **Add New → Project** and import the repo.
3. Framework Preset **Other**. Leave Build Command empty. Output Directory `.`
   (`vercel.json` already pins this.)
4. Add the environment variables below, then deploy.

Push to the default branch to redeploy.

## Environment variables

Vercel → Project → Settings → Environment Variables. Set both for
Production, Preview and Development.

| Variable | Purpose |
|---|---|
| `ASTREA_PASSWORD` | The access password. Defaults to `Astrea_Is_#1` if unset. |
| `ASTREA_SECRET` | Signs the session cookie. Generate with `openssl rand -base64 32`. |

**Set `ASTREA_SECRET` before you share the link.** Without it the code falls back to a
known development string, and anyone who reads this repository could forge a session
cookie without ever knowing the password.

If the repository is public, set `ASTREA_PASSWORD` too — the fallback value is visible
in `api/_auth.js`.

## How the gate works

1. Any request to a protected path hits `middleware.js` at the edge, before any file is served.
2. It looks for the `astrea_session` cookie: `<expiry>.<HMAC-SHA256(expiry, ASTREA_SECRET)>`.
3. No cookie, a bad signature or an expired timestamp → 302 to `/login`, carrying the
   original path in `?next=` so the user lands where they meant to.
4. `/login` posts to `/api/login`, which compares the password in constant time and, on
   success, sets the cookie `HttpOnly; Secure; SameSite=Lax; Max-Age=43200` (12 hours).
5. `Sign out` in the dashboard top bar hits `/api/logout`, which expires the cookie.

An unauthenticated request never receives the dashboard HTML. This is a real
server-side gate, not a JavaScript prompt over an already-downloaded page.

## What it does not do

This is a demo gate, not an identity system. There are no user accounts, no audit of
who signed in, and only a fixed 600 ms delay on a failed attempt rather than real rate
limiting. Everyone shares one password, so rotating it means telling everyone.

If this ever needs to hold real customer data or satisfy a security review, replace it
with Vercel Authentication (Project → Settings → Deployment Protection) or a proper
identity provider.

## Local development

```bash
npm i -g vercel
vercel dev
```

`vercel dev` runs the middleware and the API routes the same way production does.
Opening `index.html` directly from the filesystem bypasses the gate — that is expected,
because the gate lives on the server.

## Changing the password

Update `ASTREA_PASSWORD` in Vercel and redeploy. Existing sessions stay valid for up to
12 hours; rotate `ASTREA_SECRET` at the same time to invalidate them immediately.
