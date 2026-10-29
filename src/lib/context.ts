import 'server-only';
import { getUnit } from './syllabus';
import type { LearnContext } from './types';

export interface ResolvedUnit {
  unitId: string;
  title: string;
  crumbs: { label: string; href?: string }[];
  ctx: LearnContext;
  topics: string[];
  marks: number | null;
  subjectId?: string;
  examId?: string;
  cls?: number;
}

/** Turns a unit id (board chapter or exam unit) into a learning context for the AI. */
export function resolveUnit(unitId: string): ResolvedUnit | null {
  const r = getUnit(unitId);
  if (!r) return null;
  if (r.kind === 'board') {
    const s = r.subject, u = r.unit;
    return {
      unitId, title: u.name, topics: u.topics, marks: u.marks, subjectId: s.id, cls: s.cls,
      crumbs: [{ label: `${s.board} · Class ${s.cls}`, href: '/student/syllabus' }, { label: s.name, href: `/student/subject/${encodeURIComponent(s.id)}` }],
      ctx: { kind: 'board', unitId, board: s.board, cls: s.cls, subject: s.name, unit: u.name, topics: u.topics.slice(0, 30) },
    };
  }
  const e = r.exam, u = r.unit;
  return {
    unitId, title: u.name, topics: u.topics, marks: null, examId: e.id,
    crumbs: [{ label: 'Competitive exams', href: '/student/exams' }, { label: e.name, href: `/student/exams/${e.id}` }, { label: r.section }],
    ctx: { kind: 'exam', unitId, exam: e.name, examId: e.id, subject: r.section, unit: u.name, topics: u.topics.slice(0, 30), cls: u.cls ? Number(u.cls.slice(0, 2)) || null : null },
  };
}
