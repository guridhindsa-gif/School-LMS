'use client';
/**
 * Interface translations for English, Hindi and Punjabi (Gurmukhi).
 * Dictionaries are split by area (messages/*.ts) so they stay reviewable; every key must exist
 * in all three languages (enforced by i18n.test.ts). Missing keys fall back to English, then the key.
 * The language is the learner's saved profile language (zustand + localStorage), so it persists
 * across navigation and visits and is shared by the student and staff apps on this device.
 */
import { useCallback, useEffect } from 'react';
import { useLMS } from '../store';
import { localeOf, translate, type Lang, type Vars } from './core';

export { LANGS, localeOf, translate } from './core';
export type { Lang } from './core';

/** `t('nav.home')`, `t('home.answerMore', { n: 3 })`. Re-renders when the language changes. */
export function useT() {
  const lang = useLMS(s => s.profile.language) as Lang;
  const t = useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang]);
  /** Translate, or use `fallback` (e.g. English data text) when no translation key exists. */
  const tf = useCallback((key: string, fallback: string, vars?: Vars) => { const s = translate(lang, key, vars); return s === key ? fallback : s; }, [lang]);
  return { t, tf, lang, locale: localeOf(lang) };
}

/** Keeps <html lang> in sync so screen readers and Indic font fallbacks use the right language. */
export function LangSync() {
  const lang = useLMS(s => s.profile.language);
  useEffect(() => { document.documentElement.lang = lang || 'en'; }, [lang]);
  return null;
}
