import { chatStream } from '@/lib/ollama';
import { lessonPrompt } from '@/lib/prompts';
import { lessonBody } from '@/lib/validate';
import { errorResponse, streamHeaders } from '@/lib/api';
import type { LearnContext } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Streams a Markdown lesson for one chapter, pitched to the student's class. */
export async function POST(req: Request) {
  try {
    const { ctx } = lessonBody.parse(await req.json());
    const stream = await chatStream(
      [
        { role: 'system', content: 'You are an expert Indian school teacher and textbook writer. Accurate, clear, syllabus-aligned.' },
        { role: 'user', content: lessonPrompt(ctx as LearnContext) },
      ],
      { temperature: 0.4, signal: req.signal },
    );
    return new Response(stream, { headers: streamHeaders });
  } catch (e) {
    return errorResponse(e);
  }
}
