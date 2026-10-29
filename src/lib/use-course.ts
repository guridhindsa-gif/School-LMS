'use client';
import { useEffect, useState } from 'react';
import type { Track } from './types';
import type { Profile } from './types';

export interface CourseSubject { id: string; name: string; book?: string; verified: string; unitCount: number; session?: string; units?: { id: string; name: string }[] }
export interface CourseGroup { group: string; subjects: CourseSubject[] }

/** Loads the student's subjects (and competitive tracks) for their board/class/stream. */
export function useCourse(profile: Profile, full = false) {
  const [data, setData] = useState<{ groups: CourseGroup[]; tracks: Track[] } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!profile.board || !profile.cls) return;
    const c = new AbortController();
    const p = new URLSearchParams({ board: profile.board, cls: String(profile.cls) });
    if (profile.stream) p.set('stream', profile.stream);
    if (full) p.set('full', '1');
    setData(null); setError('');
    fetch(`/api/syllabus?${p}`, { signal: c.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setData)
      .catch(e => { if (e.name !== 'AbortError') setError('Could not load your syllabus.'); });
    return () => c.abort();
  }, [profile.board, profile.cls, profile.stream, full]);
  return { data, error };
}
