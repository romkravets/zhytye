/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer — don't leak path to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable dangerous browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Cross-Origin isolation
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js inline scripts + React hydration require unsafe-inline in dev;
      // in production you can tighten this further with nonces.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Google Fonts (next/font inlines CSS, but keep for fallback @import)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      // Anthropic called server-side — not needed here; but allow same-origin API
      "connect-src 'self'",
      "img-src 'self' data:",
      "frame-ancestors 'self'",
    ].join('; '),
  },
  // HSTS — enforced after first visit (max 1 year)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const nextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
