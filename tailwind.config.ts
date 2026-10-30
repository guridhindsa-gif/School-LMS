import type { Config } from 'tailwindcss';

/**
 * Design tokens live in src/app/globals.css as RGB triplets (so Tailwind can apply alpha).
 * See DESIGN.md for the rationale. Legacy names (board, chalk, marigold, sky) are kept as
 * aliases of the new semantic tokens so older screens keep working.
 */
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        surface2: c('surface-2'),
        surface3: c('surface-3'),
        ink: c('ink'),
        muted: c('muted'),
        line: c('line'),
        primary: c('primary'),
        primary2: c('primary-2'),
        onprimary: c('on-primary'),
        teal: c('teal'),
        accent: c('accent'),
        night: c('night'),
        night2: c('night-2'),
        onnight: c('on-night'),
        good: c('good'),
        warn: c('warn'),
        bad: c('bad'),
        violet: c('violet'),
        // legacy aliases
        board: c('night'),
        board2: c('night-2'),
        chalk: c('on-night'),
        marigold: c('accent'),
        sky: c('primary'),
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-plex, "IBM Plex Mono")', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xl2: '1.25rem', card: 'var(--r-card)', ctl: 'var(--r-ctl)' },
      boxShadow: {
        soft: 'var(--e1)',
        lift: 'var(--e2)',
        float: 'var(--e3)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        floaty: { '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        floaty: 'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
