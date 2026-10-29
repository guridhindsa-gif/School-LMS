'use client';
import type { Difficulty, LearnContext, Question } from './types';

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

export const friendlyError = (e: unknown) =>
  e instanceof AIError ? e.message : (e as Error)?.name === 'AbortError' ? '' : 'Could not reach the AI service. Check that the app is running and Ollama is configured.';
