'use client';
import type { Difficulty, LearnContext, Question } from './types';
import { translate, type Lang } from './i18n/core';
import { useLMS } from './store';

export class AIError extends Error {
  constructor(message: string, public code = 'error') { super(message); }
}

async function check(res: Response) {
  if (res.ok) return;
  let msg = `Request failed (${res.status})`, code = 'error';
  try { const j = await res.json(); msg = j.error || msg; code = j.code || code; } catch { /* ignore */ }
  throw new AIError(msg, code);
}

/** POSTs and streams the plain-text reply, calling onText with the full text so far. */
export async function streamText(url: string, body: unknown, onText: (full: string) => void, signal?: AbortSignal) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
  await check(res);
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let full = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    full += dec.decode(value, { stream: true });
    onText(full);
  }
  return full;
}

export async function getQuestions(ctx: LearnContext, opts: { n: number; difficulty: Difficulty | 'mixed'; purpose: 'practice' | 'test' | 'diagnostic' | 'mock'; avoid?: string[] }, signal?: AbortSignal): Promise<Question[]> {
  const res = await fetch('/api/ai/questions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, ...opts }), signal,
  });
  await check(res);
  const j = await res.json();
  return j.questions as Question[];
}

const CODE_KEY: Record<string, string> = {
  unreachable: 'ai.unreachable', unauthorized: 'ai.unauthorized', model_not_found: 'ai.modelMissing',
  invalid_json: 'ai.badOutput', no_scenes: 'ai.badOutput', no_questions: 'ai.badOutput', bad_request: 'ai.badRequest',
};

/**
 * A short, translated explanation of an AI failure for learners and staff ('' when the user stopped it).
 * Known server error codes map to translated messages; unknown server messages are passed through.
 */
export function friendlyError(e: unknown): string {
  if ((e as Error)?.name === 'AbortError') return '';
  let lang: Lang = 'en';
  try { lang = (useLMS.getState().profile.language || 'en') as Lang; } catch { /* store unavailable */ }
  if (e instanceof AIError) return CODE_KEY[e.code] ? translate(lang, CODE_KEY[e.code]) : e.message;
  return translate(lang, 'ai.unreachable');
}
