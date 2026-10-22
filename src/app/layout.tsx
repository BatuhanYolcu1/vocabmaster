import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Providers } from '@/components/providers';
import { MaintenanceGate } from '@/components/app/maintenance-gate';
import { SITE } from '@/lib/constants';

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'VocabMaster — İngilizce kelimeleri kalıcı öğren',
    template: '%s · VocabMaster',
  },
  description:
    'Aralıklı tekrar (SRS) ile İngilizce kelimeleri kalıcı olarak öğren. 7 çalışma modu, hazır kelime kütüphanesi, kendi listelerin ve yapay zekâ desteği.',
  keywords: ['ingilizce kelime', 'kelime ezberleme', 'aralıklı tekrar', 'flashcard', 'İngilizce öğren', 'SRS', 'YDS', 'IELTS'],
  applicationName: 'VocabMaster',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'VocabMaster',
    title: 'VocabMaster — İngilizce kelimeleri kalıcı öğren',
    description: 'Aralıklı tekrar ile her gün birkaç dakikada İngilizce kelime dağarcığını büyüt.',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.ico', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f17' },
  ],
};

// Applies the saved theme before first paint so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('vm-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-fg antialiased">
        <Providers>
          <MaintenanceGate>{children}</MaintenanceGate>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
