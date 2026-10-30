import { describe, expect, it } from 'vitest';
import { DICTS } from './messages';
import { translate } from './core';

describe('i18n dictionaries', () => {
  it('every English key exists in Hindi and Punjabi, with the same {placeholders}', () => {
    const missing: string[] = [];
    const ph = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join(',');
    for (const d of DICTS) for (const [k, v] of Object.entries(d.en)) for (const l of ['hi', 'pa'] as const) {
      if (!(k in d[l])) missing.push(`${l}:${k}`);
      else if (ph(d[l][k]) !== ph(v)) missing.push(`${l}:${k} placeholders`);
    }
    expect(missing).toEqual([]);
  });
  it('has no keys that exist only in Hindi or Punjabi', () => {
    const extra: string[] = [];
    for (const d of DICTS) for (const l of ['hi', 'pa'] as const) for (const k of Object.keys(d[l])) if (!(k in d.en)) extra.push(`${l}:${k}`);
    expect(extra).toEqual([]);
  });
  it('keys are unique across dictionaries', () => {
    const seen = new Set<string>(), dup: string[] = [];
    for (const d of DICTS) for (const k of Object.keys(d.en)) { if (seen.has(k)) dup.push(k); seen.add(k); }
    expect(dup).toEqual([]);
  });
  it('interpolates and falls back to English', () => {
    expect(translate('hi', 'shell.class', { n: 7 })).toBe('कक्षा 7');
    expect(translate('pa', 'no.such.key')).toBe('no.such.key');
  });
});
