import { chatStream, ollamaConfig } from '@/lib/ollama';
import { tutorSystem } from '@/lib/prompts';
import { chatBody } from '@/lib/validate';
import { errorResponse, streamHeaders } from '@/lib/api';
import type { LearnContext } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** AI tutor: streams the reply as plain text. */
export async function POST(req: Request) {
  try {
    const body = chatBody.parse(await req.json());
    const ctx = (body.ctx ?? null) as LearnContext | null;
    const messages = [
      { role: 'system' as const, content: tutorSystem(ctx, body.mode) },
      ...body.messages.slice(-16),
    ];
    const stream = await chatStream(messages, { temperature: 0.5, signal: req.signal, model: ollamaConfig().model });
    return new Response(stream, { headers: streamHeaders });
  } catch (e) {
    return errorResponse(e);
  }
}
