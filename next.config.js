/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// script-src: unsafe-eval needed only in dev (Next.js HMR / React DevTools)
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const ContentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  // Anthropic is called server-side only — browser only needs same-origin API
  "connect-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'none'",
  "object-src 'none'",               // blocks Flash / plugins
  "base-uri 'self'",                 // blocks <base> tag injection
  "form-action 'self'",              // blocks form hijacking
  "frame-ancestors 'self'",          // clickjacking (CSP level 2+)
  "upgrade-insecure-requests",       // auto-upgrade http:// sub-resources
].join('; ');

const securityHeaders = [
  // ── Transport ──────────────────────────────────────────────────────────────
  // HSTS: 2 years + preload — once submitted to browsers' preload lists,
  // the site is HTTPS-only even on the first visit (no TOFU window).
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },

  // ── Injection / XSS ────────────────────────────────────────────────────────
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  // Legacy XSS filter — deprecated in modern browsers, keep for IE/Edge legacy
  { key: 'X-XSS-Protection', value: '1; mode=block' },

  // ── Clickjacking ───────────────────────────────────────────────────────────
  // X-Frame-Options kept for browsers that don't honour CSP frame-ancestors
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // ── MIME sniffing ──────────────────────────────────────────────────────────
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // ── Referrer ───────────────────────────────────────────────────────────────
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // ── Feature / Permission gating ────────────────────────────────────────────
  // Deny all hardware APIs — simulator has no need for them
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'interest-cohort=()',    // FLoC / Topics API opt-out
      'browsing-topics=()',
    ].join(', '),
  },

  // ── Cross-Origin isolation ─────────────────────────────────────────────────
  // Prevents cross-origin windows from getting a reference to this page
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  poweredByHeader: false,   // removes "X-Powered-By: Next.js" info-leakage header

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Long-term cache for immutable Next.js static assets
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
