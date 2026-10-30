/** Pure translation helpers (no React) — safe for tests and server code. */
import { DICTS, type Lang } from './messages';

export type { Lang };
export const LANGS: { id: Lang; label: string; short: string; locale: string }[] = [
  { id: 'en', label: 'English', short: 'EN', locale: 'en-IN' },
  { id: 'hi', label: 'हिंदी', short: 'हिं', locale: 'hi-IN' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', short: 'ਪੰ', locale: 'pa-IN' },
];
export const localeOf = (l: Lang) => LANGS.find(x => x.id === l)?.locale || 'en-IN';

export type Vars = Record<string, string | number>;

export function translate(lang: Lang, key: string, vars?: Vars): string {
  let s: string | undefined;
  for (const d of DICTS) { s = d[lang]?.[key]; if (s !== undefined) break; }
  if (s === undefined) for (const d of DICTS) { s = d.en[key]; if (s !== undefined) break; }
  if (s === undefined) s = key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`)) : s;
}
