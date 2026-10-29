export const config = { runtime: 'edge' };

import { cookieHeader } from './_auth.js';

export default async function handler(req) {
  return new Response(null, {
    status: 302,
    headers: {
      location: '/login',
      'cache-control': 'no-store',
      'set-cookie': cookieHeader('', 0)
    }
  });
}
