'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { applyAnswer, finishSession, newSkill, type AnswerEvent, type SkillState } from './adaptive';
import type { Profile } from './types';
import type { PlanUnit } from './prep-plan';

export interface ChapterRef { id: string; name: string; subject: string; kind: 'board' | 'exam' }
export interface DayLog { day: string; answered: number; correct: number; minutes: number }
/** Lesson path steps completed per chapter (epoch ms when done). */
export type LessonStep = 'learn' | 'explore' | 'assess';
export type StepLog = Partial<Record<LessonStep, number>> & { assessScore?: number };
/** A preparation schedule for one target exam (competitive exam id, or `board:<board>:<class>[:<stream>]`). */
export interface PrepPlan {
  id: string;
  kind: 'exam' | 'board';
  title: string;               // exam name as published (board plans build a translated title instead)
  units: PlanUnit[];           // syllabus snapshot the plan was made from
  examDate: string;            // YYYY-MM-DD
  startDate: string;           // YYYY-MM-DD, first planned day
  hoursPerDay: number;
  weeklyMock: boolean;
  subjects?: string[];         // board plans: chosen subject ids
  mastery: Record<string, number>; // mastery snapshot when the plan was made (keeps the plan stable)
  createdAt: number;
  done: string[];              // ticked task keys
}

interface State {
  profile: Profile;
  skills: Record<string, SkillState>;
  chapters: Record<string, ChapterRef>; // names for chapters the student has touched (for dashboards)
  log: DayLog[];
  xp: number;
  streak: { current: number; best: number; lastDay: string };
  seen: Record<string, string[]>; // question stems already shown per chapter (avoid repeats)
  steps: Record<string, StepLog>; // persistent lesson-path completion per chapter
  plans: Record<string, PrepPlan>; // exam preparation schedules by target id
  setProfile: (p: Partial<Profile>) => void;
  resetProfile: () => void;
  recordAnswer: (ch: ChapterRef, e: AnswerEvent & { stem?: string }) => SkillState;
  endSession: (chapterId: string, accuracy: number, minutes: number) => void;
  resetProgress: () => void;
  markStep: (chapterId: string, step: LessonStep, score?: number) => void;
  savePlan: (p: PrepPlan) => void;
  removePlan: (id: string) => void;
  toggleTask: (planId: string, key: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const defaultProfile: Profile = { name: '', board: null, cls: null, stream: null, tracks: [], language: 'en' };

export const useLMS = create<State>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      skills: {},
      chapters: {},
      log: [],
      xp: 0,
      streak: { current: 0, best: 0, lastDay: '' },
      seen: {},
      steps: {},
      plans: {},
      setProfile: p => set(s => ({ profile: { ...s.profile, ...p } })),
      resetProfile: () => set({ profile: defaultProfile }),
      recordAnswer: (ch, e) => {
        const s = get();
        const prev = s.skills[ch.id] ?? newSkill();
        const next = applyAnswer(prev, e);
        const d = today();
        const log = [...s.log];
        const i = log.findIndex(l => l.day === d);
        if (i >= 0) log[i] = { ...log[i], answered: log[i].answered + 1, correct: log[i].correct + (e.correct ? 1 : 0) };
        else log.push({ day: d, answered: 1, correct: e.correct ? 1 : 0, minutes: 0 });
        // daily streak
        let streak = s.streak;
        if (streak.lastDay !== d) {
          const y = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
          const current = streak.lastDay === y ? streak.current + 1 : 1;
          streak = { current, best: Math.max(streak.best, current), lastDay: d };
        }
        const seen = { ...s.seen };
        if (e.stem) seen[ch.id] = [...(seen[ch.id] || []), e.stem].slice(-40);
        set({
          skills: { ...s.skills, [ch.id]: next },
          chapters: { ...s.chapters, [ch.id]: ch },
          log: log.slice(-120),
          xp: s.xp + (e.correct ? (e.difficulty === 'hard' ? 15 : e.difficulty === 'medium' ? 10 : 6) : 2),
          streak,
          seen,
        });
        return next;
      },
      endSession: (chapterId, accuracy, minutes) => {
        const s = get();
        const sk = s.skills[chapterId];
        if (!sk) return;
        const d = today();
        const log = s.log.map(l => (l.day === d ? { ...l, minutes: l.minutes + minutes } : l));
        set({ skills: { ...s.skills, [chapterId]: finishSession(sk, accuracy) }, log });
      },
      resetProgress: () => set({ skills: {}, chapters: {}, log: [], xp: 0, streak: { current: 0, best: 0, lastDay: '' }, seen: {}, steps: {}, plans: {} }),
      markStep: (chapterId, step, score) => set(s => {
        const prev = s.steps[chapterId] || {};
        if (prev[step] && score === undefined) return {};
        return { steps: { ...s.steps, [chapterId]: { ...prev, [step]: prev[step] || Date.now(), ...(score !== undefined ? { assessScore: Math.max(score, prev.assessScore ?? 0) } : {}) } } };
      }),
      savePlan: p => set(s => ({ plans: { ...s.plans, [p.id]: p } })),
      removePlan: id => set(s => { const plans = { ...s.plans }; delete plans[id]; return { plans }; }),
      toggleTask: (planId, key) => set(s => {
        const p = s.plans[planId]; if (!p) return {};
        const done = p.done.includes(key) ? p.done.filter(k => k !== key) : [...p.done, key];
        return { plans: { ...s.plans, [planId]: { ...p, done } } };
      }),
    }),
    { name: 'school-lms', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

/** True after the persisted store has loaded in the browser (avoids SSR/client mismatch). */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    const unsub = useLMS.persist.onFinishHydration(() => setH(true));
    if (useLMS.persist.hasHydrated()) setH(true);
    return unsub;
  }, []);
  return h;
}
