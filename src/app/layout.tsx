import type { Metadata, Viewport } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
