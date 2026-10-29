import { NextResponse } from 'next/server';
import { chatJSON, OllamaError } from '@/lib/ollama';
import { visualLessonPrompt } from '@/lib/prompts';
import { lessonBody } from '@/lib/validate';
import { errorResponse } from '@/lib/api';
import { SCENE_GUIDE, VISUAL_JSON_SCHEMA, sanitizeLesson } from '@/lib/visual';
import type { LearnContext } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Generates a scene-based visual lesson (JSON). Invalid scenes are dropped; one retry if too few survive. */
export async function POST(req: Request) {
  try {
    const { ctx } = lessonBody.parse(await req.json());
    const messages = [
      { role: 'system' as const, content: 'You are an expert Indian school teacher and instructional designer who teaches through pictures, animation and hands-on interaction. Output JSON only.' },
      { role: 'user' as const, content: visualLessonPrompt(ctx as LearnContext, SCENE_GUIDE) },
    ];
    let lesson = sanitizeLesson(null);
    for (let attempt = 0; attempt < 2 && lesson.scenes.length < 3; attempt++) {
      lesson = sanitizeLesson(await chatJSON(messages, VISUAL_JSON_SCHEMA, { temperature: 0.5, signal: req.signal }));
    }
    if (lesson.scenes.length < 3) throw new OllamaError('The model could not build a visual lesson. Try again or use a larger model.', 502, 'no_scenes');
    return NextResponse.json(lesson);
  } catch (e) {
    return errorResponse(e);
  }
}
