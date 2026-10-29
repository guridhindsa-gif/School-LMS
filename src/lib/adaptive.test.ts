import { describe, expect, it } from 'vitest';
import { applyAnswer, band, bktUpdate, finishSession, newSkill, nextDifficulty, pCorrect, recommend } from './adaptive';

describe('BKT', () => {
  it('raises mastery after a correct answer and lowers it after a wrong one', () => {
    expect(bktUpdate(0.3, true)).toBeGreaterThan(0.3);
    expect(bktUpdate(0.6, false)).toBeLessThan(0.6);
  });
  it('a correct hard answer is stronger evidence than a correct easy one', () => {
    expect(bktUpdate(0.3, true, undefined, 'hard')).toBeGreaterThan(bktUpdate(0.3, true, undefined, 'easy'));
  });
  it('converges towards mastery with consistent correct answers', () => {
    let s = newSkill(0);
    for (let i = 0; i < 8; i++) s = applyAnswer(s, { correct: true, difficulty: 'medium', at: i });
    expect(s.pKnown).toBeGreaterThan(0.9);
    expect(band(s)).toMatch(/strong|mastered/);
  });
});

describe('difficulty selection', () => {
  it('starts at medium-ish and climbs with ability', () => {
    expect(nextDifficulty(-2)).toBe('easy');
    expect(nextDifficulty(2.5)).toBe('hard');
  });
  it('targets about 70% predicted success', () => {
    const d = nextDifficulty(0.5);
    const p = pCorrect(0.5, { easy: -1, medium: 0, hard: 1.1 }[d]);
    expect(Math.abs(p - 0.7)).toBeLessThan(0.2);
  });
  it('ability falls after wrong answers', () => {
    let s = newSkill(0);
    for (let i = 0; i < 4; i++) s = applyAnswer(s, { correct: false, difficulty: 'medium', at: i, topic: 'Snell law' });
    expect(s.ability).toBeLessThan(0);
    expect(s.weakTopics).toContain('Snell law');
    expect(nextDifficulty(s.ability)).toBe('easy');
  });
});

describe('spaced review', () => {
  it('reviews weak chapters tomorrow and strong ones later', () => {
    const weak = finishSession({ ...newSkill(0), pKnown: 0.3 }, 0.4, 0);
    const strong = finishSession({ ...newSkill(0), pKnown: 0.9, interval: 4 }, 0.9, 0);
    expect(weak.interval).toBe(1);
    expect(strong.interval).toBeGreaterThan(4);
  });
});

describe('recommend', () => {
  it('orders due reviews, then weak, then continue, then new', () => {
    const now = 10 * 86_400_000;
    const cands = [
      { id: 'a', name: 'A', order: 1 }, { id: 'b', name: 'B', order: 2 },
      { id: 'c', name: 'C', order: 3 }, { id: 'd', name: 'D', order: 4 },
    ];
    const skills = {
      a: { ...newSkill(0), attempts: 5, pKnown: 0.85, nextReview: now - 1, lastSeen: 1 },
      b: { ...newSkill(0), attempts: 3, pKnown: 0.2, nextReview: now + 5, lastSeen: 2 },
      c: { ...newSkill(0), attempts: 2, pKnown: 0.6, nextReview: now + 5, lastSeen: 3 },
    };
    const r = recommend(cands, skills, now);
    expect(r.map(x => x.reason)).toEqual(['review', 'weak', 'continue', 'new']);
    expect(r.map(x => x.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});
