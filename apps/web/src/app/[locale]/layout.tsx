import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Archivo_Black } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CustomCursor } from '@/components/motion';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import { SITE_URL } from '@/lib/site';
import { routing } from '@/i18n/routing';

const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const title = `JC Autoimport — ${t('title')}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | JC Autoimport',
    },
    description: t('description'),
    keywords: [
      'importación de vehículos',
      'autos importados',
      'vehículos premium',
      'JC Autoimport',
      'SUV importados',
      'eléctricos',
    ],
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_DO' : 'en_US',
      title,
      description: t('ogDescription'),
      url: SITE_URL,
      siteName: 'JC Autoimport',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t('ogDescription'),
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080a' },
    { media: '(prefers-color-scheme: light)', color: '#f5f5f6' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${archivoBlack.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
