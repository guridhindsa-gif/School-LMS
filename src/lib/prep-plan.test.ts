import { describe, expect, it } from 'vitest';
import { addDays, behind, buildPlan, daysBetween, unitWork, weekday, type PlanUnit } from './prep-plan';

const subj = (s: string, n: number, cls = '11'): PlanUnit[] => Array.from({ length: n }, (_, i) => ({ id: `${s}-${i}`, name: `${s} unit ${i + 1}`, subject: s, topics: 5, cls }));
const UNITS = [...subj('Physics', 10), ...subj('Chemistry', 10), ...subj('Mathematics', 8)];
const START = '2026-11-02'; // a Monday

describe('dates', () => {
  it('counts days and weekdays in UTC-safe calendar days', () => {
    expect(daysBetween('2026-11-02', '2027-01-20')).toBe(79);
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(weekday('2026-11-08')).toBe(0); // Sunday
  });
});

describe('unit work', () => {
  it('gives less time to units the student already knows', () => {
    const u = UNITS[0];
    const sum = (m?: number) => unitWork(u, m).reduce((a, w) => a + w.minutes, 0);
    expect(sum(undefined)).toBeGreaterThan(sum(0.6));
    expect(sum(0.6)).toBeGreaterThan(sum(0.85));
    expect(unitWork(u, 0.85)[0].kind).toBe('review');
    expect(unitWork(u, undefined).map(w => w.kind)).toEqual(['learn', 'practice']);
  });
});

describe('buildPlan', () => {
  const plan = buildPlan({ units: UNITS, startDate: START, examDate: '2027-04-02', hoursPerDay: 4, weeklyMock: true });

  it('schedules every day up to the exam eve, in build then final phase', () => {
    expect(plan.days.length).toBe(plan.totalDays);
    expect(plan.days[0].date).toBe(START);
    expect(plan.days[plan.days.length - 1].date).toBe('2027-04-01');
    expect(plan.days[plan.days.length - 1].tasks[0].kind).toBe('eve');
    expect(plan.days.findIndex(d => d.phase === 'final')).toBe(plan.buildDays);
    expect(plan.totalDays - plan.buildDays).toBeGreaterThanOrEqual(7);
    expect(plan.totalDays - plan.buildDays).toBeLessThanOrEqual(30);
  });

  it('covers every unit (learn and practise) before the final phase when time allows', () => {
    expect(plan.status).toBe('ok');
    const build = plan.days.filter(d => d.phase === 'build').flatMap(d => d.tasks);
    for (const u of UNITS) {
      expect(build.some(x => x.unitId === u.id && x.kind === 'learn')).toBe(true);
      expect(build.some(x => x.unitId === u.id && x.kind === 'practice')).toBe(true);
    }
  });

  it('mixes subjects within a day and keeps each day within the daily time', () => {
    const study = plan.days.filter(d => d.phase === 'build' && !d.tasks.some(x => x.kind === 'mock'));
    const mixed = study.filter(d => new Set(d.tasks.map(x => x.subject)).size >= 2).length;
    expect(mixed / study.length).toBeGreaterThan(0.8);
    for (const d of study) expect(d.tasks.reduce((a, x) => a + x.minutes, 0)).toBeLessThanOrEqual(4 * 60);
  });

  it('puts a full mock on Sundays in the build phase and adds spaced reviews', () => {
    const sundays = plan.days.filter(d => d.phase === 'build' && weekday(d.date) === 0 && daysBetween(START, d.date) >= 14);
    expect(plan.days.filter(d => daysBetween(START, d.date) < 14).some(d => d.tasks.some(x => x.kind === 'mock'))).toBe(false);
    expect(sundays.length).toBeGreaterThan(5);
    for (const d of sundays) expect(d.tasks.map(x => x.kind)).toEqual(['mock', 'analysis']);
    expect(plan.days.flatMap(d => d.tasks).filter(x => x.kind === 'review').length).toBeGreaterThan(UNITS.length);
    expect(plan.mocks).toBeGreaterThan(sundays.length);
  });

  it('has unique task keys', () => {
    const keys = plan.days.flatMap(d => d.tasks.map(x => x.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('flags a tight plan and suggests more hours when time is short', () => {
    const tight = buildPlan({ units: UNITS, startDate: START, examDate: '2026-12-20', hoursPerDay: 2, weeklyMock: true });
    expect(tight.status === 'tight' || tight.status === 'short').toBe(true);
    expect(tight.suggestHours).toBeGreaterThan(2);
    expect(tight.neededHours).toBeGreaterThan(tight.availableHours);
  });

  it('spends less time on units already mastered and revises the weakest first', () => {
    const mastery = Object.fromEntries(UNITS.slice(0, 10).map(u => [u.id, 0.9]));
    const known = buildPlan({ units: UNITS, startDate: START, examDate: '2027-04-02', hoursPerDay: 4, weeklyMock: true, mastery });
    expect(known.neededHours).toBeLessThan(plan.neededHours);
    const firstPhysicsRevise = known.days.filter(d => d.phase === 'final').flatMap(d => d.tasks).find(x => x.kind === 'revise' && x.subject === 'Physics');
    expect(firstPhysicsRevise).toBeTruthy();
  });

  it('a very near exam becomes revision only; a past date gives no plan', () => {
    const near = buildPlan({ units: UNITS, startDate: START, examDate: '2026-11-10', hoursPerDay: 3, weeklyMock: true });
    expect(near.buildDays).toBe(0);
    expect(near.days.every(d => d.phase === 'final')).toBe(true);
    expect(buildPlan({ units: UNITS, startDate: START, examDate: START, hoursPerDay: 3, weeklyMock: true }).status).toBe('past');
  });

  it('board plans use one full paper per subject in turn', () => {
    const board = buildPlan({ units: UNITS, startDate: START, examDate: '2027-02-15', hoursPerDay: 4, weeklyMock: true, fullTest: 'paper' });
    const papers = board.days.flatMap(d => d.tasks).filter(x => x.kind === 'paper');
    expect(papers.length).toBeGreaterThan(3);
    expect(new Set(papers.slice(0, 3).map(p => p.subject)).size).toBe(3);
  });

  it('counts unticked tasks before today as behind', () => {
    const today = addDays(START, 3);
    const keys = plan.days.slice(0, 3).flatMap(d => d.tasks.map(x => x.key));
    expect(behind(plan, new Set(), today)).toBe(keys.length);
    expect(behind(plan, new Set(keys), today)).toBe(0);
  });
});
