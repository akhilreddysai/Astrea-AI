/* Vercel Edge Middleware — guards everything except the login page and its API.
   An unauthenticated request never reaches the dashboard HTML. */
import { COOKIE, readCookie, verifyToken } from './api/_auth.js';

export const config = {
  matcher: ['/((?!login|api/login|api/logout|favicon.ico|robots.txt).*)']
};

export default async function middleware(req) {
  const url = new URL(req.url);

  if (await verifyToken(readCookie(req, COOKIE))) return;   // continue to the asset

  const to = new URL('/login', url.origin);
  if (url.pathname !== '/') to.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(to, 302);
}
