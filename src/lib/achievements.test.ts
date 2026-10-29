import { describe, expect, it } from 'vitest';
import { badges, dailyMission, level, xpForLevel } from './achievements';
import { newSkill } from './adaptive';

const base = { xp: 0, streak: { current: 0, best: 0 }, skills: {}, chapters: {}, log: [] };

describe('level', () => {
  it('starts at level 1 and needs 100 xp for level 2', () => {
    expect(level(0)).toMatchObject({ level: 1, toNext: 100 });
    expect(level(99).level).toBe(1);
    expect(level(100).level).toBe(2);
    expect(xpForLevel(3)).toBe(300);
    expect(level(450)).toMatchObject({ level: 3, toNext: 150 });
  });
});

describe('badges', () => {
  it('earns nothing with no activity', () => {
    expect(badges(base).filter(b => b.earned)).toHaveLength(0);
  });
  it('earns from real attempts, streaks and mastery', () => {
    const k = { ...newSkill(0), attempts: 12, correct: 10, pKnown: 0.85 };
    const s = { ...base, streak: { current: 3, best: 3 }, skills: { a: k }, chapters: { a: { subject: 'Physics' } } };
    const earned = badges(s).filter(b => b.earned).map(b => b.id);
    expect(earned).toEqual(expect.arrayContaining(['first', 'ten', 'streak3', 'strong']));
    expect(earned).not.toContain('explorer');
  });
});

describe('dailyMission', () => {
  it('counts today and due reviews', () => {
    const now = Date.parse('2026-10-29T10:00:00Z');
    const k = { ...newSkill(0), attempts: 3, nextReview: now - 1 };
    const m = dailyMission({ ...base, skills: { a: k }, log: [{ day: '2026-10-29', answered: 4, correct: 3, minutes: 5 }] }, now);
    expect(m).toMatchObject({ answered: 4, goal: 10, done: false, due: 1 });
  });
});
