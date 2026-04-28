const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zhytye.vercel.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
