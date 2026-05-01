import { JetBrains_Mono, Manrope, Noto_Serif } from 'next/font/google';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zhytye.vercel.app';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Життєздатність — симулятор українського виживання',
    template: '%s | Життєздатність',
  },
  description:
    '90 днів українського міського життя з ШІ-подіями. Симулятор бюджету, настрою і виживання — інтерактивна гра.',
  keywords: [
    'симулятор', 'Україна', 'виживання', 'ШІ', 'бюджет', 'ігра',
    'simulator', 'Ukraine', 'survival', 'AI', 'game',
  ],
  openGraph: {
    title: 'Життєздатність — симулятор',
    description: '90 днів українського міського життя. ШІ-події, бюджет, виживання.',
    type: 'website',
    locale: 'uk_UA',
    alternateLocale: 'en_US',
    siteName: 'Життєздатність',
    url: BASE_URL,
    images: [
      { url: `${BASE_URL}/og-image-1200x630.png`, width: 1200, height: 630 }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Життєздатність — симулятор',
    description: '90 днів українського міського життя з ШІ-подіями.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({ children }) {
  const fontVars = [
    notoSerif.variable,
    jetbrainsMono.variable,
    manrope.variable,
  ].join(' ');

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: BASE_URL,
    name: 'Життєздатність',
    description:
      '90 днів українського міського життя з ШІ-подіями. Симулятор бюджету, настрою і виживання — інтерактивна гра.',
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: 'Життєздатність',
      url: BASE_URL,
      sameAs: [
        'https://t.me/zhytye',
        'https://twitter.com/zhytye'
      ],
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.svg`
      }
    }
  });

  return (
    <html lang="uk" className={fontVars}>
      <head>
        <meta name="google-site-verification" content="TCpAsFwFwDmPDE_TPrmXp5Wl8a4ZBlygB-1qmR2uSBA" />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
            <meta property="og:image" content={`${BASE_URL}/og-image-1200x630.png`} />
            <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
            <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
