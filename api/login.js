export const config = { runtime: 'edge' };

import { password, safeEqual, mintToken, cookieHeader, MAX_AGE } from './_auth.js';

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, headers || {})
  });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let supplied = '';
  try {
    const body = await req.json();
    supplied = typeof body.password === 'string' ? body.password : '';
  } catch {
    return json({ error: 'Malformed request' }, 400);
  }

  if (!safeEqual(supplied, password())) {
    // Small fixed delay to blunt scripted guessing. Not a substitute for a WAF.
    await new Promise(r => setTimeout(r, 600));
    return json({ error: 'That password is not recognised.' }, 401);
  }

  return json({ ok: true }, 200, { 'set-cookie': cookieHeader(await mintToken(), MAX_AGE) });
}
