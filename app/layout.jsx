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

  return (
    <html lang="uk" className={fontVars}>
      <head>
        <meta name="google-site-verification" content="TCpAsFwFwDmPDE_TPrmXp5Wl8a4ZBlygB-1qmR2uSBA" />
      </head>
      <body>{children}</body>
    </html>
  );
}
