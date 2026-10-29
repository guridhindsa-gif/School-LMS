'use client';
import { create } from 'zustand';
import type { LearnContext } from './types';

export interface TutorMsg { role: 'user' | 'assistant'; content: string }

interface TutorState {
  open: boolean;
  ctx: LearnContext | null;
  ctxLabel: string;
  threads: Record<string, TutorMsg[]>; // per context key, kept for this browser session
  draft: string;
  setOpen: (o: boolean) => void;
  setContext: (ctx: LearnContext | null, label: string) => void;
  ask: (text: string) => void; // opens the drawer with a prepared question
  setThread: (key: string, msgs: TutorMsg[]) => void;
  setDraft: (d: string) => void;
}

export const ctxKey = (c: LearnContext | null) => (c ? `${c.kind}:${c.examId || c.board || ''}:${c.cls || ''}:${c.subject || ''}:${c.unit || ''}` : 'general');

export const useTutor = create<TutorState>()(set => ({
  open: false,
  ctx: null,
  ctxLabel: 'General help',
  threads: {},
  draft: '',
  setOpen: open => set({ open }),
  setContext: (ctx, ctxLabel) => set({ ctx, ctxLabel }),
  ask: text => set({ open: true, draft: text }),
  setThread: (key, msgs) => set(s => ({ threads: { ...s.threads, [key]: msgs.slice(-30) } })),
  setDraft: draft => set({ draft }),
}));
