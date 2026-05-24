import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'MarketPlaceX — Comprá y Vendé de Todo',
    template: '%s | MarketPlaceX',
  },
  description: 'El marketplace moderno para comprar y vender de todo en Argentina. Publicá gratis y contactate directamente con los vendedores.',
  keywords: ['marketplace', 'comprar', 'vender', 'clasificados', 'segunda mano', 'argentina', 'usado'],
  authors: [{ name: 'MarketPlaceX' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'MarketPlaceX',
    title: 'MarketPlaceX — Comprá y Vendé de Todo',
    description: 'El marketplace moderno para comprar y vender de todo en Argentina.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarketPlaceX',
    description: 'Comprá y vendé de todo, gratis y sin intermediarios.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f1f5f9',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
