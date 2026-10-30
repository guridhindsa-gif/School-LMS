import type { Metadata, Viewport } from 'next';
import { Baloo_2, Bricolage_Grotesque, Figtree, IBM_Plex_Mono, Noto_Sans_Devanagari, Noto_Sans_Gurmukhi } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

// next/font downloads these at build time and serves them from this app: no runtime request to Google Fonts.
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const body = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });
const junior = Baloo_2({ subsets: ['latin', 'devanagari'], variable: '--font-baloo', display: 'swap', preload: false });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-plex', display: 'swap', preload: false });
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--font-deva', display: 'swap', preload: false });
const guru = Noto_Sans_Gurmukhi({ subsets: ['gurmukhi'], variable: '--font-guru', display: 'swap', preload: false });
const fontVars = [display, body, junior, mono, deva, guru].map(f => f.variable).join(' ');

export const metadata: Metadata = {
  title: { default: 'School LMS', template: '%s · School LMS' },
  description: 'CBSE and CISCE Classes 1–12 with JEE, NEET and entrance tracks, an AI tutor and adaptive learning.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1411' },
  ],
};

// Sets the theme class before paint (no flash): saved choice, else system preference.
const themeScript = `(function(){try{var t=localStorage.getItem('lms-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
