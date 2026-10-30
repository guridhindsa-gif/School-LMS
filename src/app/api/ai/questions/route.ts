import { NextResponse } from 'next/server';
import { OllamaError } from '@/lib/ollama';
import { aiFor, chatJSON } from '@/lib/ai';
import { QUESTION_SCHEMA, questionsPrompt } from '@/lib/prompts';
import { questionOut, questionsBody } from '@/lib/validate';
import { errorResponse } from '@/lib/api';
import type { LearnContext, Question } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Generates MCQs as structured JSON. Invalid items are dropped; one retry if nothing usable came back. */
export async function POST(req: Request) {
  try {
    const ai = aiFor(req);
    const b = questionsBody.parse(await req.json());
    const ctx = b.ctx as LearnContext;
    const ask = () => chatJSON<{ questions?: unknown[] } | unknown[]>(
      ai,
      [
        { role: 'system', content: 'You write accurate, unambiguous exam questions for Indian school boards and entrance exams. Output JSON only.' },
        { role: 'user', content: questionsPrompt(ctx, b.n, b.difficulty, b.purpose, b.avoid) },
      ],
      QUESTION_SCHEMA,
      { temperature: 0.5, signal: req.signal },
    );
    let questions: Question[] = [];
    for (let attempt = 0; attempt < 2 && !questions.length; attempt++) {
      const raw = await ask();
      const list = Array.isArray(raw) ? raw : (raw as { questions?: unknown[] }).questions ?? [];
      questions = list
        .map(q => questionOut.safeParse(q))
        .filter(r => r.success)
        .map((r, i) => {
          const q = r.data!;
          return { id: `${Date.now().toString(36)}-${i}`, ...q, whyWrong: q.whyWrong?.slice(0, q.options.length) } as Question;
        })
        .slice(0, b.n);
    }
    if (!questions.length) throw new OllamaError('The model returned no usable questions. Try again, or use a larger model.', 502, 'no_questions');
    return NextResponse.json({ questions });
  } catch (e) {
    return errorResponse(e);
  }
}
