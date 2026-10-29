'use client';
import { Trash2 } from 'lucide-react';
import { Empty, cx } from '@/components/ui';
import { LOCAL_NOTE, useSchool, useSchoolHydrated } from '@/lib/school-store';
import { ReviewSteps } from './ReviewSteps';

/** Lessons and assignments the teacher has saved on this device, with their review state. */
export function SavedWork() {
  const hydrated = useSchoolHydrated();
  const { lessons, assignments, setLessonState, removeLesson, removeAssignment } = useSchool();
  if (!hydrated) return null;
  return (
    <section className="card grid content-start gap-4 p-5 sm:p-6" aria-labelledby="sw-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 id="sw-title" className="h-section">Your saved work</h2><p className="text-sm text-muted">{LOCAL_NOTE}</p></div>
      </div>
      {!lessons.length && !assignments.length ? (
        <Empty title="Nothing saved yet">Draft a lesson or an assignment above. Saved items and their review status appear here.</Empty>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-2">
            <p className="eyebrow">Lessons · {lessons.length}</p>
            {lessons.map(l => (
              <div key={l.id} className="grid gap-2 rounded-ctl border border-line p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1"><b className="block truncate">{l.topic}</b><span className="text-xs text-muted">Class {l.cls} · {l.subject} · {new Date(l.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                  <button className="btn-icon h-8 w-8" aria-label={`Delete lesson ${l.topic}`} onClick={() => removeLesson(l.id)}><Trash2 size={14} /></button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ReviewSteps state={l.state} />
                  <div className="ml-auto flex gap-1.5">
                    {l.state === 'draft' && <button className="btn-soft min-h-8 px-3 py-1 text-xs" onClick={() => setLessonState(l.id, 'review')}>Send for review</button>}
                    {l.state === 'review' && <button className="btn-board min-h-8 px-3 py-1 text-xs" onClick={() => setLessonState(l.id, 'approved')}>Approve</button>}
                    {l.state !== 'draft' && <button className="btn-ghost min-h-8 px-3 py-1 text-xs" onClick={() => setLessonState(l.id, l.state === 'approved' ? 'review' : 'draft')}>Step back</button>}
                  </div>
                </div>
              </div>
            ))}
            {!lessons.length && <p className="text-sm text-muted">No lessons saved.</p>}
          </div>
          <div className="grid content-start gap-2">
            <p className="eyebrow">Assignments · {assignments.length}</p>
            {assignments.map(a => {
              const late = a.due < new Date().toISOString().slice(0, 10);
              return (
                <div key={a.id} className="flex items-start gap-2 rounded-ctl border border-line p-3">
                  <div className="min-w-0 flex-1">
                    <b className="block truncate">{a.topic}</b>
                    <span className="text-xs text-muted">{a.section} · {a.questions.length} question{a.questions.length > 1 ? 's' : ''}</span>
                  </div>
                  <span className={cx('pill', late ? 'bg-surface2 text-muted' : 'bg-teal/12 text-teal')}>Due {new Date(a.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <button className="btn-icon h-8 w-8" aria-label={`Delete assignment ${a.topic}`} onClick={() => removeAssignment(a.id)}><Trash2 size={14} /></button>
                </div>
              );
            })}
            {!assignments.length && <p className="text-sm text-muted">No assignments saved.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
