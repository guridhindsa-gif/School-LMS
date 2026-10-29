'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { applyAnswer, finishSession, newSkill, type AnswerEvent, type SkillState } from './adaptive';
import type { Profile } from './types';

export interface ChapterRef { id: string; name: string; subject: string; kind: 'board' | 'exam' }
export interface DayLog { day: string; answered: number; correct: number; minutes: number }

interface State {
  profile: Profile;
  skills: Record<string, SkillState>;
  chapters: Record<string, ChapterRef>; // names for chapters the student has touched (for dashboards)
  log: DayLog[];
  xp: number;
  streak: { current: number; best: number; lastDay: string };
  seen: Record<string, string[]>; // question stems already shown per chapter (avoid repeats)
  setProfile: (p: Partial<Profile>) => void;
  resetProfile: () => void;
  recordAnswer: (ch: ChapterRef, e: AnswerEvent & { stem?: string }) => SkillState;
  endSession: (chapterId: string, accuracy: number, minutes: number) => void;
  resetProgress: () => void;
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
      resetProgress: () => set({ skills: {}, chapters: {}, log: [], xp: 0, streak: { current: 0, best: 0, lastDay: '' }, seen: {} }),
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
