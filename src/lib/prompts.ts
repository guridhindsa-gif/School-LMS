import type { Difficulty, LearnContext } from './types';

const LANG = { en: 'English', hi: 'Hindi (Devanagari script)', pa: 'Punjabi (Gurmukhi script)' };

export function audience(ctx: LearnContext) {
  if (ctx.kind === 'exam') return `a student preparing for ${ctx.exam}. Match the real exam's depth and style and point out common traps.`;
  const c = ctx.cls ?? 10;
  if (c === 13) return 'a repeater JEE/NEET student. Use entrance-exam depth.';
  if (c <= 2) return `a ${c === 1 ? '6' : '7'}-year-old in Class ${c}. Use very short sentences, simple words, friendly examples from home and school. Read-aloud friendly.`;
  if (c <= 5) return `a Class ${c} student (about ${c + 5} years old). Use simple words, everyday Indian examples and short paragraphs.`;
  if (c <= 8) return `a Class ${c} middle-school student. Explain clearly, add a small activity and real-life Indian examples.`;
  if (c <= 10) return `a Class ${c} student preparing for the ${ctx.board} board exam. Use board-exam depth with competency- and case-based thinking.`;
  return `a Class ${c} student. Use ${ctx.board} board depth and add JEE/NEET-level extensions where useful.`;
}

export function scope(ctx: LearnContext) {
  const lines: string[] = [];
  if (ctx.kind === 'exam') {
    lines.push(`Exam: ${ctx.exam}`);
    if (ctx.subject) lines.push(`Subject / section: ${ctx.subject}`);
  } else {
    lines.push(`Board: ${ctx.board}`, `Class: ${ctx.cls === 13 ? 'Repeater (post-12)' : ctx.cls}`, `Subject: ${ctx.subject}`);
  }
  if (ctx.unit) lines.push(`Chapter / unit: ${ctx.unit}`);
  if (ctx.topics?.length) lines.push(`Official sub-topics: ${ctx.topics.join('; ')}`);
  if (ctx.units?.length) lines.push(`Units in scope: ${ctx.units.join('; ')}`);
  if (typeof ctx.mastery === 'number') lines.push(`Student's current mastery of this chapter: ${Math.round(ctx.mastery * 100)}%`);
  if (ctx.weakTopics?.length) lines.push(`Topics the student recently got wrong: ${ctx.weakTopics.join('; ')}`);
  return lines.join('\n');
}

const MATH_RULE = 'For maths and science formulas use LaTeX inside $...$ (inline) or $$...$$ (display).';

export function tutorSystem(ctx: LearnContext | null, mode: 'socratic' | 'explain' | 'check') {
  const lang = LANG[ctx?.language || 'en'];
  const base = `You are "Vidya", a warm, patient AI tutor inside a school LMS for Indian students (CBSE and CISCE boards, JEE, NEET and other entrance exams).
Reply in ${lang}. Keep answers short and conversational (under 180 words unless asked for more). Use Markdown. ${MATH_RULE}
Stay on schoolwork. If asked something unsafe or unrelated to learning, gently steer back. Never invent syllabus facts; if unsure, say so.`;
  const style = {
    socratic: `Teach the Socratic way. Do NOT give the final answer straight away. Ask one guiding question at a time, give the smallest useful hint, and let the student do the thinking. If the student is stuck after two hints, show the next step only. Praise effort specifically.`,
    explain: `Explain clearly with one worked example and a quick analogy. End with one short check-for-understanding question.`,
    check: `The student will share their working or answer. Check it step by step, point to the exact first mistake, explain why, and ask them to fix it. If it is right, confirm and suggest a harder follow-up.`,
  }[mode];
  return `${base}\n\n${style}${ctx ? `\n\nCurrent learning context:\n${scope(ctx)}\nThe student is ${audience(ctx)}` : ''}`;
}

export function lessonPrompt(ctx: LearnContext) {
  const lang = LANG[ctx.language || 'en'];
  const words = ctx.kind === 'board' && (ctx.cls ?? 10) <= 5 ? 300 : 700;
  return `Write a lesson in ${lang} for ${audience(ctx)}
${scope(ctx)}

Cover every official sub-topic listed, in order. Format in Markdown:
- "## " heading for each part, short paragraphs, bullet lists
- at least one worked example with numbered steps where the subject allows
- a "> **Remember**" block with 3–5 key points
- a "## Common mistakes" section with 2–3 bullets
- end with "## Quick check": 3 short questions, each followed on the next line by "**Answer:** ..."
${MATH_RULE}
About ${words} words. Do not add a preamble before the first heading.`;
}

export const QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          answer: { type: 'integer', minimum: 0, maximum: 3 },
          explanation: { type: 'string' },
          hint: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          topic: { type: 'string' },
          whyWrong: { type: 'array', items: { type: 'string' } },
        },
        required: ['q', 'options', 'answer', 'explanation', 'hint', 'difficulty', 'topic'],
      },
    },
  },
  required: ['questions'],
} as const;

export function questionsPrompt(ctx: LearnContext, n: number, difficulty: Difficulty | 'mixed', purpose: 'practice' | 'test' | 'diagnostic' | 'mock', avoid: string[] = []) {
  const lang = LANG[ctx.language || 'en'];
  const style = ctx.kind === 'exam'
    ? `in the exact ${ctx.exam} question style`
    : (ctx.cls ?? 10) <= 5 ? 'simple and friendly, one idea per question'
    : (ctx.cls ?? 10) <= 8 ? 'school-test style'
    : `${ctx.board} board-exam style, including competency/case-based and assertion–reason questions where suitable`;
  const spread = purpose === 'diagnostic' ? 'Spread questions across ALL units in scope, from easy to hard, to find the starting level.'
    : purpose === 'mock' ? 'Spread questions across all subjects/sections in the exam\'s real proportions.'
    : 'Cover the official sub-topics; target the weak topics first if listed.';
  return `Create ${n} multiple-choice questions in ${lang} for ${audience(ctx)}
${scope(ctx)}

Difficulty: ${difficulty === 'mixed' ? 'mix of easy, medium and hard' : `all ${difficulty}`}. ${spread}
Style: ${style}.
Each question has exactly 4 options and exactly one correct answer ("answer" is its 0-based index). Double-check every answer.
"explanation": why the correct option is right (1–3 sentences). "hint": a nudge that does not reveal the answer. "topic": ${purpose === 'diagnostic' || purpose === 'mock' ? 'copy EXACTLY the name of the unit it tests from "Units in scope"' : 'the sub-topic tested'}. "whyWrong": for each option, a short reason it is wrong (empty string for the correct one) — this powers misconception feedback.
${MATH_RULE}
${avoid.length ? `Do not repeat these questions: ${avoid.slice(-12).join(' | ')}` : ''}
Reply with JSON only: {"questions":[...]}`;
}
