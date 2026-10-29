import { NextResponse } from 'next/server';
import { getCourse, getTracks, searchUnits } from '@/lib/syllabus';

export const dynamic = 'force-dynamic';

/** GET /api/syllabus?board=CBSE&cls=11&stream=PCM  → subjects (grouped) and competitive tracks
 *  GET /api/syllabus?q=refraction&board=CBSE&cls=10 → chapter search */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get('q');
  const board = u.searchParams.get('board') || 'CBSE';
  const cls = Number(u.searchParams.get('cls') || 0);
  const stream = u.searchParams.get('stream');
  if (q) return NextResponse.json({ results: searchUnits(q, board, cls || undefined) });
  if (!cls || cls < 1 || cls > 13) return NextResponse.json({ error: 'cls must be 1–13' }, { status: 400 });
  return NextResponse.json({ groups: getCourse(board, cls, stream, u.searchParams.get('full') === '1'), tracks: getTracks(cls, stream) });
}
