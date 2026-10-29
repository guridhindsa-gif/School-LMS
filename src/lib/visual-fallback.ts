import samples from '@/data/visual-samples.json';
import type { LearnContext } from './types';
import type { VisualLesson } from './visual';

/** Offline demo lesson: a hand-made sample when one fits, otherwise a generic picture lesson from the official sub-topics. */
export function demoVisualLesson(ctx: LearnContext): VisualLesson {
  const n = `${ctx.unit || ''} ${ctx.subject || ''}`.toLowerCase();
  const S = samples as unknown as Record<string, VisualLesson>;
  if (/kinematic|projectile|motion in a (straight line|plane)|equations of motion/.test(n)) return S.kinematics;
  if (/photosynth|nutrition in plants|plants? make|plant physiology|food/.test(n) && !/chemistry/.test(n)) return S.plants;
  if ((ctx.cls ?? 9) <= 2 && /number|count|math/.test(n)) return S.numbers;
  const unit = (ctx.unit || 'This chapter').replace(/^(unit|chapter|topic)\s*[\w.]*\s*[:.—-]\s*/i, '');
  const topics = (ctx.topics?.length ? ctx.topics : ['Key idea', 'How it works', 'Where we use it']).slice(0, 6).map(t => t.replace(/^chapter\s*\d+\s*:\s*/i, '').split(/ — |: /)[0].slice(0, 40));
  const pics = ['💡', '🔍', '⚙️', '🧪', '📐', '🌍', '📘', '🧭'];
  return {
    title: unit,
    scenes: [
      { type: 'intro', title: unit, narration: `Let's explore ${unit}. This demo lesson is built from the official syllabus; connect the AI for a full picture lesson.`, emoji: '✨', bullets: topics.slice(0, 3) },
      { type: 'concept_map', title: 'What this chapter covers', narration: 'Tap each idea to see what it is about.', center: { label: unit.slice(0, 40), emoji: '📘' }, nodes: topics.map((t, i) => ({ label: t, emoji: pics[i % pics.length], detail: `Official sub-topic ${i + 1} of this chapter.` })) },
      { type: 'steps', title: 'Your learning path', narration: 'We will go through these one by one.', steps: topics.slice(0, 5).map((t, i) => ({ label: t, emoji: pics[(i + 2) % pics.length], detail: `Step ${i + 1}` })) },
      { type: 'flashcards', title: 'Key terms', narration: 'Flip each card.', cards: topics.slice(0, 4).map((t, i) => ({ front: t, back: `Ask the AI tutor to explain “${t}” with an example.`, emoji: pics[i % pics.length] })) },
      { type: 'quiz', title: 'Quick check', narration: 'Ready?', q: `Which of these is part of ${unit}?`, options: [topics[0], 'Cooking recipes', 'Football rules', 'Film reviews'], answer: 0, explanation: `${topics[0]} is listed in the official syllabus for this chapter.` },
    ],
  };
}
