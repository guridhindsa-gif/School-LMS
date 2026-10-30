'use client';
/**
 * Staff-side work saved on this device only (there is no school server yet).
 * Every screen that writes here must say so plainly: nothing is sent to students,
 * teachers or parents until a school data service is connected.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import type { Question } from './types';

export type ReviewState = 'draft' | 'review' | 'approved';

export interface SavedLesson { id: string; cls: number; subject: string; topic: string; text: string; state: ReviewState; savedAt: number }
export interface SavedAssignment { id: string; cls: number; section: string; topic: string; due: string; questions: Question[]; savedAt: number }
export interface ParentNote { id: string; child: string; curiosity: string; note: string; savedAt: number }
export type Frequency = 'urgent' | 'daily' | 'weekly';
export interface AdminFlag { id: string; subjectId: string; subjectName: string; reason: string; note: string; savedAt: number }

interface SchoolState {
  lessons: SavedLesson[];
  assignments: SavedAssignment[];
  parentNotes: ParentNote[];
  parentPrefs: { frequency: Frequency };
  flags: AdminFlag[];
  /** Show clearly labelled, invented demo figures on teacher/parent/principal pages. Off by default. */
  demo: boolean;
  setDemo: (on: boolean) => void;
  saveLesson: (l: SavedLesson) => void;
  setLessonState: (id: string, state: ReviewState) => void;
  removeLesson: (id: string) => void;
  saveAssignment: (a: SavedAssignment) => void;
  removeAssignment: (id: string) => void;
  addParentNote: (n: ParentNote) => void;
  setParentPrefs: (p: Partial<SchoolState['parentPrefs']>) => void;
  addFlag: (f: AdminFlag) => void;
  removeFlag: (id: string) => void;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const useSchool = create<SchoolState>()(
  persist(
    set => ({
      lessons: [],
      assignments: [],
      parentNotes: [],
      parentPrefs: { frequency: 'weekly' },
      flags: [],
      demo: false,
      setDemo: demo => set({ demo }),
      saveLesson: l => set(s => ({ lessons: [l, ...s.lessons.filter(x => x.id !== l.id)].slice(0, 30) })),
      setLessonState: (id, state) => set(s => ({ lessons: s.lessons.map(l => (l.id === id ? { ...l, state } : l)) })),
      removeLesson: id => set(s => ({ lessons: s.lessons.filter(l => l.id !== id) })),
      saveAssignment: a => set(s => ({ assignments: [a, ...s.assignments].slice(0, 30) })),
      removeAssignment: id => set(s => ({ assignments: s.assignments.filter(a => a.id !== id) })),
      addParentNote: n => set(s => ({ parentNotes: [n, ...s.parentNotes].slice(0, 20) })),
      setParentPrefs: p => set(s => ({ parentPrefs: { ...s.parentPrefs, ...p } })),
      addFlag: f => set(s => ({ flags: [f, ...s.flags].slice(0, 100) })),
      removeFlag: id => set(s => ({ flags: s.flags.filter(f => f.id !== id) })),
    }),
    {
      name: 'school-lms-school', storage: createJSONStorage(() => localStorage), version: 2,
      // v1 stored English labels and a parent-only language; the language is now global (learner profile).
      migrate: (old: unknown) => {
        const o = (old || {}) as Record<string, unknown> & { parentPrefs?: { frequency?: string } };
        const f = o.parentPrefs?.frequency || '';
        const frequency: Frequency = /urgent/i.test(f) ? 'urgent' : /daily/i.test(f) ? 'daily' : 'weekly';
        return { ...o, parentPrefs: { frequency }, demo: false } as unknown as SchoolState;
      },
    },
  ),
);

/** Translation key for the honest local-only save note. */
export const LOCAL_NOTE_KEY = 'roles.localNote';

/** True once the saved staff work has loaded in the browser (avoids SSR/client mismatch). */
export function useSchoolHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    const unsub = useSchool.persist.onFinishHydration(() => setH(true));
    if (useSchool.persist.hasHydrated()) setH(true);
    return unsub;
  }, []);
  return h;
}
