/* Shared auth helpers. Edge runtime — Web Crypto only, no Node APIs. */

export const COOKIE = 'astrea_session';
export const MAX_AGE = 60 * 60 * 12;          // 12 hours

const enc = new TextEncoder();

/** The demo password. Override in Vercel → Settings → Environment Variables. */
export function password() {
  return process.env.ASTREA_PASSWORD || 'Astrea_Is_#1';
}

/** Cookie signing secret. Set ASTREA_SECRET in production. */
export function secret() {
  return process.env.ASTREA_SECRET || 'astrea-dev-secret-change-me';
}

function b64url(buf) {
  let s = '';
  const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sign(msg) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

/** Constant-time string comparison. */
export function safeEqual(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export async function mintToken() {
  const exp = Date.now() + MAX_AGE * 1000;
  return exp + '.' + (await sign(String(exp)));
}

export async function verifyToken(token) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 1) return false;
  const exp = token.slice(0, i), sig = token.slice(i + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await sign(exp));
}

export function readCookie(req, name) {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      try { return decodeURIComponent(part.slice(eq + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

export function cookieHeader(value, maxAge) {
  return [
    COOKIE + '=' + encodeURIComponent(value),
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=' + maxAge
  ].join('; ');
}
