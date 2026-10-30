/**
 * Exam preparation schedule
 * -------------------------
 * Turns a target exam date, daily study time and the student's current mastery into a
 * day-by-day plan:
 *   1. Build phase: every unit is learnt and practised, subjects interleaved within each day,
 *      with spaced quick reviews 7 and 21 days after a unit is finished and (optionally)
 *      a full mock test plus analysis every Sunday.
 *   2. Final phase (last ~15% of the time, 7–30 days): revision of the weakest units first,
 *      a mock or full paper every third day, and a light exam-eve day.
 * Units the student already knows get less time (practice or a quick review only).
 * Pure functions, no browser APIs: unit-tested in prep-plan.test.ts.
 */

export type TaskKind = 'learn' | 'practice' | 'review' | 'revise' | 'mock' | 'paper' | 'analysis' | 'eve';
export type Phase = 'build' | 'final';
export type PlanStatus = 'ok' | 'tight' | 'short' | 'past';

export interface PlanUnit { id: string; name: string; subject: string; topics?: number; cls?: string | null }
export interface PlanTask { key: string; kind: TaskKind; minutes: number; unitId?: string; unitName?: string; subject?: string }
export interface PlanDay { date: string; phase: Phase; tasks: PlanTask[] }

export interface PlanInput {
  units: PlanUnit[];
  startDate: string;           // YYYY-MM-DD (first study day)
  examDate: string;            // YYYY-MM-DD (exam day; not scheduled)
  hoursPerDay: number;
  weeklyMock: boolean;         // Sunday mock + analysis during the build phase
  mastery?: Record<string, number>; // pKnown for units the student has practised
  mockMinutes?: number;        // length of one full mock (default 180)
  fullTest?: 'mock' | 'paper'; // competitive mock (one paper) or a board paper per subject
}

export interface PlanResult {
  days: PlanDay[];
  status: PlanStatus;
  totalDays: number;
  buildDays: number;
  finalStart: string;
  neededHours: number;         // to cover everything at full depth
  availableHours: number;      // study time in the build phase
  suggestHours?: number;       // hours/day that would cover everything, when tight
  plannedHours: number;
  mocks: number;
  unitsTotal: number;
}

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
export const dayNum = (d: string) => Math.round(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / DAY);
export const dayStr = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);
export const weekday = (d: string) => new Date(dayNum(d) * DAY).getUTCDay(); // 0 = Sunday
export const addDays = (d: string, n: number) => dayStr(dayNum(d) + n);
export const daysBetween = (a: string, b: string) => dayNum(b) - dayNum(a);
/** Today in the device's own time zone, as YYYY-MM-DD. */
export const localToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const MAX_SESSION = 90;
const REVIEW_MIN = 20;
const round5 = (m: number) => Math.max(5, Math.round(m / 5) * 5);

/** Full-depth minutes for a unit, from its number of official sub-topics. */
export function unitMinutes(u: PlanUnit) {
  const topics = Math.min(Math.max(u.topics ?? 4, 1), 10);
  return 120 + 40 * topics;
}

/** How a unit is studied given mastery: new units are learnt then practised; known units get less. */
export function unitWork(u: PlanUnit, m?: number): { kind: 'learn' | 'practice' | 'review'; minutes: number }[] {
  const base = unitMinutes(u);
  if (m === undefined) return [{ kind: 'learn', minutes: base * 0.6 }, { kind: 'practice', minutes: base * 0.4 }];
  if (m >= 0.95) return [{ kind: 'review', minutes: base * 0.12 }];
  if (m >= 0.8) return [{ kind: 'review', minutes: base * 0.25 }];
  if (m >= 0.5) return [{ kind: 'practice', minutes: base * 0.55 }];
  return [{ kind: 'learn', minutes: base * 0.45 }, { kind: 'practice', minutes: base * 0.35 }];
}

const clsRank = (c?: string | null) => (!c ? 0 : c.includes('-') ? parseFloat(c) + 0.5 : parseFloat(c) || 0);

interface Session { kind: 'learn' | 'practice' | 'review'; minutes: number; unit: PlanUnit; last: boolean }

export function buildPlan(input: PlanInput): PlanResult {
  const { units, startDate, examDate, weeklyMock } = input;
  const H = Math.min(Math.max(input.hoursPerDay || 2, 0.5), 14);
  const mastery = input.mastery || {};
  const mockMin = input.mockMinutes ?? 180;
  const fullTest = input.fullTest ?? 'mock';
  const total = daysBetween(startDate, examDate);
  const subjects = [...new Set(units.map(u => u.subject))];

  const empty: PlanResult = { days: [], status: 'past', totalDays: Math.max(0, total), buildDays: 0, finalStart: examDate, neededHours: 0, availableHours: 0, plannedHours: 0, mocks: 0, unitsTotal: units.length };
  if (total <= 0 || !units.length) return empty;

  const finalLen = total < 14 ? total : Math.min(30, Math.max(7, Math.round(total * 0.15)));
  const buildDays = total - finalLen;
  const finalStart = addDays(startDate, buildDays);
  // weekly mocks start once there is something to test (from the third week)
  const mockSunday = (d: string) => weeklyMock && buildDays >= 21 && daysBetween(startDate, d) >= 14 && weekday(d) === 0;

  // ---- work per subject, in syllabus order (Class 11 before 12; units already strong go last)
  const perSubject = subjects.map(s => units
    .filter(u => u.subject === s)
    .map((u, i) => ({ u, i, strong: (mastery[u.id] ?? 0) >= 0.8 }))
    .sort((a, b) => Number(a.strong) - Number(b.strong) || clsRank(a.u.cls) - clsRank(b.u.cls) || a.i - b.i)
    .map(x => x.u));

  let studyDays = 0;
  for (let i = 0; i < buildDays; i++) if (!mockSunday(addDays(startDate, i))) studyDays++;
  const capacity = studyDays * H * 60;
  const workOf = (u: PlanUnit) => unitWork(u, mastery[u.id]);
  const fullNeed = units.reduce((a, u) => a + workOf(u).reduce((b, w) => b + w.minutes, 0) + 2 * REVIEW_MIN, 0);
  const scale = buildDays > 0 && fullNeed > capacity ? capacity / fullNeed : 1;
  let status: PlanStatus = buildDays <= 0 ? 'short' : scale >= 0.999 ? 'ok' : scale >= 0.45 ? 'tight' : 'short';

  const streams: Session[][] = perSubject.map(list => list.flatMap(u => {
    const out: Session[] = [];
    for (const w of workOf(u)) {
      let left = Math.max(w.kind === 'review' ? REVIEW_MIN : 30, round5(w.minutes * scale));
      while (left > 0) { const m = left > MAX_SESSION + 20 ? MAX_SESSION : left; out.push({ kind: w.kind, minutes: m, unit: u, last: false }); left -= m; }
    }
    if (out.length) out[out.length - 1].last = true;
    return out;
  }));

  const days: PlanDay[] = [];
  const reviews = new Map<number, PlanUnit[]>();
  const finalN = dayNum(finalStart);
  let rr = 0;      // round-robin subject pointer
  let filler = 0;  // pointer for extra practice once everything is covered
  // extra practice once everything is covered: weakest units first, subjects taken in turn
  const bySubj = subjects.map(s => units.filter(u => u.subject === s).sort((a, b) => (mastery[a.id] ?? 0.5) - (mastery[b.id] ?? 0.5)));
  const fillOrder: PlanUnit[] = [];
  for (let i = 0; i < Math.max(0, ...bySubj.map(l => l.length)); i++) for (const l of bySubj) if (l[i]) fillOrder.push(l[i]);
  let mocks = 0;

  const t = (date: string, i: number, kind: TaskKind, minutes: number, u?: PlanUnit, subject?: string): PlanTask =>
    ({ key: `${date}|${kind}|${u?.id ?? subject ?? ''}|${i}`, kind, minutes: Math.round(minutes), unitId: u?.id, unitName: u?.name, subject: u?.subject ?? subject });

  // ---- build phase
  for (let i = 0; i < buildDays; i++) {
    const date = addDays(startDate, i), n = dayNum(date);
    const tasks: PlanTask[] = [];
    if (mockSunday(date)) {
      if (fullTest === 'mock') tasks.push(t(date, 0, 'mock', mockMin));
      else tasks.push(t(date, 0, 'paper', mockMin, undefined, subjects[mocks % subjects.length]));
      tasks.push(t(date, 1, 'analysis', 60));
      mocks++;
      // reviews due today move to Monday
      const due = reviews.get(n); if (due) { reviews.set(n + 1, [...(reviews.get(n + 1) || []), ...due]); reviews.delete(n); }
      days.push({ date, phase: 'build', tasks });
      continue;
    }
    let rem = H * 60;
    const due = reviews.get(n) || [];
    reviews.delete(n);
    const todayReviews = due.slice(0, 3);
    if (due.length > 3) reviews.set(n + 1, [...due.slice(3), ...(reviews.get(n + 1) || [])]);
    for (const u of todayReviews) { tasks.push(t(date, tasks.length, 'review', REVIEW_MIN, u)); rem -= REVIEW_MIN; }

    let guard = 0;
    while (rem >= 25 && guard++ < 50) {
      const live = streams.map((s, k) => (s.length ? k : -1)).filter(k => k >= 0);
      if (!live.length) break;
      const k = live[rr % live.length];
      const s = streams[k][0];
      let take = s.minutes;
      if (take > rem) {
        // split, but never leave a scrap shorter than 30 minutes for another day
        take = Math.floor(rem / 5) * 5;
        if (s.minutes - take < 30) take = s.minutes - 30;
        if (take < 25) break;
      }
      const same = tasks.find(x => x.unitId === s.unit.id && x.kind === s.kind);
      if (same) same.minutes += take; else tasks.push(t(date, tasks.length, s.kind, take, s.unit));
      rem -= take;
      if (take >= s.minutes) {
        streams[k].shift();
        if (s.last) for (const gap of [7, 21]) if (n + gap < finalN) reviews.set(n + gap, [...(reviews.get(n + gap) || []), s.unit]);
        rr++;
      } else s.minutes -= take;
    }
    // everything covered: extra practice on the weakest units
    while (rem >= 30 && !streams.some(s => s.length) && fillOrder.length) {
      const u = fillOrder[filler++ % fillOrder.length];
      const m = Math.min(45, rem);
      tasks.push(t(date, tasks.length, 'practice', m, u));
      rem -= m;
    }
    days.push({ date, phase: 'build', tasks });
  }
  const uncovered = streams.reduce((a, s) => a + s.length, 0);
  if (uncovered && status === 'ok') status = 'tight';

  // ---- final phase: revise weakest first, full test every third day, light exam eve
  const revOrder = subjects.map(s => units.filter(u => u.subject === s).sort((a, b) => (mastery[a.id] ?? 0.3) - (mastery[b.id] ?? 0.3)));
  let rp = 0, rs = 0;
  for (let i = 0; i < finalLen; i++) {
    const date = addDays(finalStart, i);
    const tasks: PlanTask[] = [];
    if (i === finalLen - 1) tasks.push(t(date, 0, 'eve', Math.min(90, H * 60)));
    else if (i % 3 === 2) {
      if (fullTest === 'mock') tasks.push(t(date, 0, 'mock', mockMin));
      else tasks.push(t(date, 0, 'paper', mockMin, undefined, subjects[mocks % subjects.length]));
      tasks.push(t(date, 1, 'analysis', 60));
      mocks++;
    } else {
      let rem = H * 60, guard = 0;
      while (rem >= 30 && guard++ < 40) {
        const list = revOrder[rs % revOrder.length];
        const u = list[Math.floor(rp / revOrder.length) % list.length];
        const m = Math.min(45, rem);
        tasks.push(t(date, tasks.length, 'revise', m, u));
        rem -= m; rp++; rs++;
      }
    }
    days.push({ date, phase: 'final', tasks });
  }

  const planned = days.reduce((a, d) => a + d.tasks.reduce((b, x) => b + x.minutes, 0), 0);
  return {
    days, status, totalDays: total, buildDays, finalStart,
    neededHours: Math.round(fullNeed / 60), availableHours: Math.round(capacity / 60),
    suggestHours: status === 'ok' || !studyDays ? undefined : Math.min(14, Math.ceil((fullNeed / studyDays / 60) * 2) / 2),
    plannedHours: Math.round(planned / 60), mocks, unitsTotal: units.length,
  };
}

/** Tasks scheduled before `today` that are not ticked off. */
export function behind(plan: PlanResult, done: Set<string>, today: string) {
  return plan.days.filter(d => d.date < today).reduce((a, d) => a + d.tasks.filter(x => !done.has(x.key)).length, 0);
}
