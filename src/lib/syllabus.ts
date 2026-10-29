import 'server-only';
import data from '@/data/syllabus.json';
import type { Exam, Group, Subject, Track } from './types';

const D = data as unknown as {
  generated: string;
  subjects: Record<string, Subject>;
  catalog: Record<string, Group[]>;
  tracks: Track[];
  exams: Record<string, Exam>;
};

export const EXAM_ORDER = ['jee_main', 'jee_adv', 'neet', 'cuet', 'clat', 'nda', 'bitsat', 'ipmat', 'nata', 'uceed', 'ioqm', 'nse'];

export function catalogKey(board: string, cls: number, stream?: string | null) {
  return `${board}-${cls}${cls >= 11 && stream ? '-' + stream : ''}`;
}

/** Subjects for a board/class/stream, grouped (compulsory, electives...). Lightweight: units omitted. */
export function getCourse(board: string, cls: number, stream?: string | null, withUnits = false) {
  if (cls === 13) return [];
  const groups = D.catalog[catalogKey(board, cls, stream)] || [];
  return groups.map(g => ({
    group: g.g,
    subjects: g.ids.map(id => {
      const s = D.subjects[id];
      return {
        id: s.id, name: s.name, book: s.book, verified: s.verified, unitCount: s.units.length, session: s.session,
        ...(withUnits ? { units: s.units.map(u => ({ id: u.id, name: u.name })) } : {}),
      };
    }),
  }));
}

export function getSubject(id: string): Subject | null {
  return D.subjects[id] ?? null;
}

export function getUnit(unitId: string) {
  const [sid] = unitId.split('~');
  const s = D.subjects[sid];
  if (s) {
    const u = s.units.find(x => x.id === unitId);
    if (u) return { kind: 'board' as const, subject: s, unit: u };
  }
  for (const e of Object.values(D.exams)) {
    for (const sb of e.subjects) {
      const u = sb.units.find(x => x.id === unitId);
      if (u) return { kind: 'exam' as const, exam: e, section: sb.name, unit: u };
    }
  }
  return null;
}

export function getTracks(cls: number, stream?: string | null) {
  const key = cls >= 11 ? (stream || 'PCM') : '_';
  return D.tracks.filter(t => (t.allow[String(cls)] || []).includes(key));
}
export const getTrack = (id: string) => D.tracks.find(t => t.id === id) ?? null;
export const getExam = (id: string): Exam | null => D.exams[id] ?? null;
export const listExams = () => EXAM_ORDER.filter(id => D.exams[id]).map(id => D.exams[id]);
export const dataGenerated = D.generated;

/** Search across chapters (for the command palette). */
export function searchUnits(q: string, board?: string, cls?: number, limit = 20) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const out: { id: string; name: string; subject: string; where: string }[] = [];
  for (const s of Object.values(D.subjects)) {
    if (board && !s.board.startsWith(board === 'CBSE' ? 'CBSE' : 'I') && !(board === 'CISCE' && s.board === 'CISCE')) continue;
    if (cls && s.cls !== cls) continue;
    for (const u of s.units) {
      if (u.name.toLowerCase().includes(needle) || u.topics.some(t => t.toLowerCase().includes(needle))) {
        out.push({ id: u.id, name: u.name, subject: s.name, where: `${s.board} · Class ${s.cls}` });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
