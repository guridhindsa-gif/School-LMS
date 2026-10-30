import samples from '@/data/visual-samples.json';
import type { LearnContext } from './types';
import type { VisualLesson } from './visual';

type Tr = (key: string, vars?: Record<string, string | number>) => string;
const EN: Record<string, string> = {
  'fb.introNarr': 'This lesson is built directly from the official syllabus for {unit}. It is not written by AI.',
  'fb.mapTitle': 'What the syllabus covers', 'fb.mapNarr': 'Tap each idea to read the official wording.',
  'fb.stepsTitle': 'Your path through the chapter', 'fb.stepsNarr': 'Work through these in order. Use the lab and the tutor when you are ready.',
  'fb.cardsTitle': 'Key terms', 'fb.cardsNarr': 'Flip a card to read the syllabus wording. Explain it aloud in your own words.',
  'fb.cardBack': 'From the syllabus: {text}', 'fb.quizTitle': 'Quick check', 'fb.quizNarr': 'Which of these is part of this chapter?',
  'fb.quizQ': 'Which of these is listed in the syllabus for {unit}?', 'fb.quizWhy': '“{topic}” is listed in the official syllabus for this chapter.',
  'fb.none': 'The official syllabus lists no separate sub-topics for this chapter.', 'fb.other1': 'Cooking recipes', 'fb.other2': 'Football rules', 'fb.other3': 'Film reviews',
};
const en: Tr = (k, v) => (EN[k] || k).replace(/\{(\w+)\}/g, (_, x) => String(v?.[x] ?? ''));

const clean = (s: string) => s.replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '').trim();
const short = (s: string, n = 44) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

/**
 * Lesson used when the AI is unavailable: a hand-authored sample when one fits, otherwise a lesson
 * assembled only from the chapter's official sub-topics. Callers must label it as not AI-generated.
 */
export function demoVisualLesson(ctx: LearnContext, tr: Tr = en): VisualLesson {
  const n = `${ctx.unit || ''} ${ctx.subject || ''}`.toLowerCase();
  const S = samples as unknown as Record<string, VisualLesson>;
  if (/kinematic|projectile|motion in a (straight line|plane)|equations of motion/.test(n)) return S.kinematics;
  if (/photosynth|nutrition in plants|plants? make|plant physiology|food/.test(n) && !/chemistry/.test(n)) return S.plants;
  if ((ctx.cls ?? 9) <= 2 && /number|count|math/.test(n)) return S.numbers;

  const unit = clean(ctx.unit || 'This chapter');
  // official sub-topics, split into their parts ("A — b, c; d") so each idea gets its own card
  const parts = (ctx.topics || []).flatMap(t => clean(t).split(/\s*[;—]\s*|\s*:\s+/)).map(s => s.trim()).filter(s => s.length > 2);
  const ideas = Array.from(new Set(parts)).slice(0, 6);
  const pics = ['💡', '🔍', '⚙️', '🧪', '📐', '🌍'];
  if (!ideas.length) {
    return { title: unit, scenes: [
      { type: 'intro', title: unit, narration: `${tr('fb.introNarr', { unit })} ${tr('fb.none')}`, emoji: '📘', bullets: [] },
      { type: 'concept_map', title: tr('fb.mapTitle'), narration: tr('fb.none'), center: { label: short(unit, 40), emoji: '📘' }, nodes: [{ label: short(unit, 40), emoji: '💡', detail: tr('fb.none') }] },
    ] };
  }
  const opts = [tr('fb.other1'), tr('fb.other2'), tr('fb.other3')];
  const at = unit.length % 4; // vary the position of the right answer
  opts.splice(at, 0, short(ideas[0], 40));
  return {
    title: unit,
    scenes: [
      { type: 'intro', title: unit, narration: tr('fb.introNarr', { unit }), emoji: '📘', bullets: ideas.slice(0, 3).map(i => short(i, 60)) },
      { type: 'concept_map', title: tr('fb.mapTitle'), narration: tr('fb.mapNarr'), center: { label: short(unit, 40), emoji: '📘' }, nodes: ideas.map((t, i) => ({ label: short(t, 40), emoji: pics[i % pics.length], detail: t })) },
      { type: 'steps', title: tr('fb.stepsTitle'), narration: tr('fb.stepsNarr'), steps: ideas.slice(0, 5).map((t, i) => ({ label: short(t, 40), emoji: pics[(i + 2) % pics.length], detail: t })) },
      { type: 'flashcards', title: tr('fb.cardsTitle'), narration: tr('fb.cardsNarr'), cards: ideas.slice(0, 4).map((t, i) => ({ front: short(t, 40), back: tr('fb.cardBack', { text: short(t, 140) }), emoji: pics[i % pics.length] })) },
      { type: 'quiz', title: tr('fb.quizTitle'), narration: tr('fb.quizNarr'), q: tr('fb.quizQ', { unit: short(unit, 60) }), options: opts, answer: at, explanation: tr('fb.quizWhy', { topic: short(ideas[0], 60) }) },
    ],
  };
}
