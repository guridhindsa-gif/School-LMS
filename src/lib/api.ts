import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { OllamaError } from './ollama';

export function errorResponse(e: unknown) {
  if (e instanceof ZodError) return NextResponse.json({ error: 'Invalid request', code: 'invalid_request', issues: e.issues.slice(0, 5) }, { status: 400 });
  if (e instanceof OllamaError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  if ((e as Error)?.name === 'AbortError') return new NextResponse(null, { status: 499 });
  console.error(e);
  return NextResponse.json({ error: 'Something went wrong', code: 'server_error' }, { status: 500 });
}

export const streamHeaders = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store, no-transform',
  'X-Accel-Buffering': 'no',
};
