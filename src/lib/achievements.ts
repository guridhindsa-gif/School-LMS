/**
 * Gamification derived only from real learner state (skills, log, streak, xp).
 * Nothing here is invented: every badge is earned by something the learner actually did
 * on this device. Pure functions — unit-tested in achievements.test.ts.
 */
import type { SkillState } from './adaptive';

export interface LearnerSnapshot {
  xp: number;
  streak: { current: number; best: number };
  skills: Record<string, SkillState>;
  chapters: Record<string, { subject: string }>;
  log: { day: string; answered: number; correct: number; minutes: number }[];
}

/** XP needed to *reach* level n (n ≥ 1): 0, 100, 300, 600, 1000 … */
export const xpForLevel = (n: number) => (50 * (n - 1) * n);

export function level(xp: number) {
  let n = 1;
  while (xpForLevel(n + 1) <= xp) n++;
  const from = xpForLevel(n), to = xpForLevel(n + 1);
  return { level: n, from, to, progress: (xp - from) / (to - from), toNext: to - xp };
}

export interface Badge { id: string; title: string; desc: string; emoji: string; earned: boolean; progress: number }

export function badges(s: LearnerSnapshot): Badge[] {
  const started = Object.entries(s.skills).filter(([, k]) => k.attempts > 0);
  const answered = started.reduce((a, [, k]) => a + k.attempts, 0);
  const correct = started.reduce((a, [, k]) => a + k.correct, 0);
  const strong = started.filter(([, k]) => k.pKnown >= 0.8).length;
  const subjects = new Set(started.map(([id]) => s.chapters[id]?.subject).filter(Boolean)).size;
  const b = (id: string, title: string, desc: string, emoji: string, have: number, need: number): Badge =>
    ({ id, title, desc, emoji, earned: have >= need, progress: Math.min(1, have / need) });
  return [
    b('first', 'First step', 'Answer your first question', '🌱', answered, 1),
    b('ten', 'Ten right', 'Get 10 answers correct', '🎯', correct, 10),
    b('streak3', 'On a roll', 'Learn 3 days in a row', '🔥', s.streak.best, 3),
    b('streak7', 'Week warrior', 'Learn 7 days in a row', '🏅', s.streak.best, 7),
    b('strong', 'Got it', 'Reach strong mastery in a chapter', '💡', strong, 1),
    b('explorer', 'Explorer', 'Practise chapters in 3 subjects', '🧭', subjects, 3),
    b('fifty', 'Half century', 'Answer 50 questions', '🏏', answered, 50),
    b('master5', 'Five strong', 'Strong mastery in 5 chapters', '🏆', strong, 5),
  ];
}

export const DAILY_GOAL = 10;

/** Today's mission: a question goal plus any reviews that are due. */
export function dailyMission(s: LearnerSnapshot, now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10);
  const today = s.log.find(l => l.day === day);
  const answered = today?.answered ?? 0;
  const due = Object.values(s.skills).filter(k => k.attempts > 0 && k.nextReview <= now).length;
  return { answered, goal: DAILY_GOAL, done: answered >= DAILY_GOAL, progress: Math.min(1, answered / DAILY_GOAL), due };
}
