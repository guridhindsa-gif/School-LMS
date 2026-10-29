/**
 * Adaptive learning engine
 * ------------------------
 * 1. Bayesian Knowledge Tracing (BKT) — probability the student has mastered a chapter,
 *    updated after every answer (accounts for lucky guesses and careless slips).
 * 2. Elo-style ability — a per-chapter ability score that picks the next question's
 *    difficulty so the student succeeds ~70% of the time (the "desirable difficulty" zone).
 * 3. Spaced review — when a chapter is next due for revision, based on mastery and streak.
 * 4. Recommendations — what to study next: due reviews, then weakest started chapters,
 *    then the next new chapter.
 * Pure functions, no browser APIs: unit-tested in adaptive.test.ts.
 */
import type { Difficulty } from './types';

export interface SkillState {
  pKnown: number;      // BKT mastery probability 0..1
  ability: number;     // Elo-style ability, ~ -3..3
  attempts: number;
  correct: number;
  streak: number;      // consecutive correct
  lastSeen: number;    // epoch ms
  nextReview: number;  // epoch ms
  interval: number;    // days
  ease: number;        // spaced-repetition ease factor
  weakTopics: string[];
}

export const BKT = { pInit: 0.15, pLearn: 0.12, pSlip: 0.1, pGuess: 0.25 };
export const DIFF_B: Record<Difficulty, number> = { easy: -1, medium: 0, hard: 1.1 };
const DAY = 86_400_000;

export function newSkill(now = Date.now()): SkillState {
  return { pKnown: BKT.pInit, ability: 0, attempts: 0, correct: 0, streak: 0, lastSeen: 0, nextReview: now, interval: 0, ease: 2.3, weakTopics: [] };
}

/** BKT posterior update after one observed answer, then the learning transition. */
export function bktUpdate(pKnown: number, correct: boolean, p = BKT, difficulty: Difficulty = 'medium') {
  // harder questions are less guessable and more slip-prone
  const guess = difficulty === 'easy' ? p.pGuess + 0.05 : difficulty === 'hard' ? p.pGuess - 0.08 : p.pGuess;
  const slip = difficulty === 'hard' ? p.pSlip + 0.05 : p.pSlip;
  const posterior = correct
    ? (pKnown * (1 - slip)) / (pKnown * (1 - slip) + (1 - pKnown) * guess)
    : (pKnown * slip) / (pKnown * slip + (1 - pKnown) * (1 - guess));
  const next = posterior + (1 - posterior) * p.pLearn;
  return clamp(next, 0.01, 0.995);
}

/** Probability of a correct answer given ability and question difficulty (logistic / Rasch). */
export const pCorrect = (ability: number, b: number) => 1 / (1 + Math.exp(-(ability - b)));

export function eloUpdate(ability: number, difficulty: Difficulty, correct: boolean, attempts: number) {
  const k = attempts < 5 ? 0.6 : attempts < 20 ? 0.4 : 0.25; // learn fast at first, then stabilise
  const expected = pCorrect(ability, DIFF_B[difficulty]);
  return clamp(ability + k * ((correct ? 1 : 0) - expected), -3, 3);
}

/** Pick the difficulty whose predicted success is closest to the target (default 70%). */
export function nextDifficulty(ability: number, target = 0.7): Difficulty {
  let best: Difficulty = 'medium', gap = Infinity;
  (Object.keys(DIFF_B) as Difficulty[]).forEach(d => {
    const g = Math.abs(pCorrect(ability, DIFF_B[d]) - target);
    if (g < gap) { gap = g; best = d; }
  });
  return best;
}

/** Spaced review scheduling (SM-2 inspired, driven by mastery). */
export function schedule(s: SkillState, sessionAccuracy: number, now = Date.now()): Pick<SkillState, 'interval' | 'ease' | 'nextReview'> {
  let ease = clamp(s.ease + (sessionAccuracy - 0.7) * 0.6, 1.3, 2.8);
  let interval: number;
  if (s.pKnown < 0.4 || sessionAccuracy < 0.5) interval = 1;
  else if (s.interval <= 1) interval = s.pKnown > 0.8 ? 4 : 2;
  else interval = Math.round(s.interval * ease);
  interval = clamp(interval, 1, 60);
  return { interval, ease, nextReview: now + interval * DAY };
}

export interface AnswerEvent { correct: boolean; difficulty: Difficulty; topic?: string; at?: number }

export function applyAnswer(s: SkillState, e: AnswerEvent): SkillState {
  const at = e.at ?? Date.now();
  const weak = new Set(s.weakTopics);
  if (e.topic) { if (e.correct) weak.delete(e.topic); else weak.add(e.topic); }
  return {
    ...s,
    pKnown: bktUpdate(s.pKnown, e.correct, BKT, e.difficulty),
    ability: eloUpdate(s.ability, e.difficulty, e.correct, s.attempts),
    attempts: s.attempts + 1,
    correct: s.correct + (e.correct ? 1 : 0),
    streak: e.correct ? s.streak + 1 : 0,
    lastSeen: at,
    weakTopics: [...weak].slice(-8),
  };
}

export function finishSession(s: SkillState, sessionAccuracy: number, now = Date.now()): SkillState {
  return { ...s, ...schedule(s, sessionAccuracy, now) };
}

export type MasteryBand = 'new' | 'learning' | 'practising' | 'strong' | 'mastered';
export function band(s?: SkillState): MasteryBand {
  if (!s || s.attempts === 0) return 'new';
  if (s.pKnown >= 0.95) return 'mastered';
  if (s.pKnown >= 0.8) return 'strong';
  if (s.pKnown >= 0.5) return 'practising';
  return 'learning';
}

export interface Candidate { id: string; name: string; order: number }
export interface Recommendation { id: string; name: string; reason: 'review' | 'weak' | 'continue' | 'new'; mastery: number }

/** What to study next, in priority order. */
export function recommend(cands: Candidate[], skills: Record<string, SkillState>, now = Date.now(), limit = 4): Recommendation[] {
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  const push = (c: Candidate, reason: Recommendation['reason']) => {
    if (seen.has(c.id) || out.length >= limit) return;
    seen.add(c.id);
    out.push({ id: c.id, name: c.name, reason, mastery: skills[c.id]?.pKnown ?? 0 });
  };
  const started = cands.filter(c => skills[c.id]?.attempts);
  started.filter(c => skills[c.id].nextReview <= now && skills[c.id].pKnown >= 0.5)
    .sort((a, b) => skills[a.id].nextReview - skills[b.id].nextReview).forEach(c => push(c, 'review'));
  started.filter(c => skills[c.id].pKnown < 0.5)
    .sort((a, b) => skills[a.id].pKnown - skills[b.id].pKnown).forEach(c => push(c, 'weak'));
  started.filter(c => skills[c.id].pKnown < 0.95)
    .sort((a, b) => skills[b.id].lastSeen - skills[a.id].lastSeen).forEach(c => push(c, 'continue'));
  cands.filter(c => !skills[c.id]?.attempts).sort((a, b) => a.order - b.order).forEach(c => push(c, 'new'));
  return out;
}

/** Diagnostic placement: turns per-unit results into starting mastery estimates. */
export function placeFromDiagnostic(results: { unitId: string; correct: boolean; difficulty: Difficulty }[], skills: Record<string, SkillState>, now = Date.now()) {
  const next = { ...skills };
  for (const r of results) {
    const s = next[r.unitId] ?? newSkill(now);
    next[r.unitId] = applyAnswer(s, { correct: r.correct, difficulty: r.difficulty, at: now });
  }
  return next;
}

export function clamp(x: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, x)); }
