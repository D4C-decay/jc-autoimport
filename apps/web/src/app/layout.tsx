import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Archivo_Black } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CustomCursor } from '@/components/motion';
import { THEME_STORAGE_KEY } from '@/components/theme-toggle';
import { SITE_URL } from '@/lib/site';

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JC Autoimport — Importación premium de vehículos',
    template: '%s | JC Autoimport',
  },
  description:
    'Importamos vehículos premium desde Estados Unidos, Japón, Corea del Sur y Europa. Inspección, verificación y entrega llave en mano. Catálogo actualizado con precios reales.',
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
    locale: 'es_DO',
    title: 'JC Autoimport — Importación premium de vehículos',
    description:
      'Catálogo de vehículos importados con inspección y entrega llave en mano.',
    url: SITE_URL,
    siteName: 'JC Autoimport',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JC Autoimport — Importación premium de vehículos',
    description: 'Catálogo de vehículos importados con inspección y entrega llave en mano.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080a' },
    { media: '(prefers-color-scheme: light)', color: '#f5f5f6' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${archivoBlack.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
