import { NextResponse } from 'next/server';
import { aiFor, health } from '@/lib/ai';
import { errorResponse } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** AI connection status for the provider this request would use (the user's own Claude key, or the school's AI). */
export async function GET(req: Request) {
  try {
    return NextResponse.json(await health(aiFor(req)), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return errorResponse(e);
  }
}
