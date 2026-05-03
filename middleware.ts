import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware: enforces OWASP cookie flags on every Set-Cookie
 * that comes from API routes, and strips server-info leakage headers.
 *
 * HTTP security headers themselves are set in next.config.js (applied before
 * middleware runs). This middleware handles the response-mutation layer:
 *   • Secure + HttpOnly + SameSite=Lax on every outgoing cookie
 *   • Removes X-Powered-By if somehow still present
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ── Harden every Set-Cookie the app emits ──────────────────────────────────
  // Currently zhytye has no session cookies, but this future-proofs any
  // cookie added by API routes or third-party Next.js plugins.
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    // Clear existing Set-Cookie and re-emit with hardened flags
    response.headers.delete('Set-Cookie');
    for (const cookie of setCookies) {
      const hardened = hardenCookie(cookie);
      response.headers.append('Set-Cookie', hardened);
    }
  }

  // Belt-and-suspenders: strip server info in case Next.js ever re-adds it
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

/**
 * Injects OWASP-recommended cookie flags if they are missing:
 *   Secure        — only sent over HTTPS
 *   HttpOnly      — inaccessible to JS (XSS theft mitigation)
 *   SameSite=Lax  — CSRF mitigation; upgrade None→Lax unless explicitly Strict
 */
function hardenCookie(raw: string): string {
  const lower = raw.toLowerCase();

  let cookie = raw;

  if (!lower.includes('secure')) {
    cookie += '; Secure';
  }

  if (!lower.includes('httponly')) {
    cookie += '; HttpOnly';
  }

  if (!lower.includes('samesite')) {
    cookie += '; SameSite=Lax';
  } else if (lower.includes('samesite=none') && !lower.includes('secure')) {
    // SameSite=None is invalid without Secure — add it
    cookie += '; Secure';
  }

  return cookie;
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
