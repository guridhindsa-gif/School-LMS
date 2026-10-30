'use client';
import { Trash2 } from 'lucide-react';
import { EmptyArt } from '@/components/art';
import { Empty, cx } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { LOCAL_NOTE_KEY, useSchool, useSchoolHydrated } from '@/lib/school-store';
import { ReviewSteps } from './ReviewSteps';

/** Lessons and assignments the teacher has saved on this device, with their review state. */
export function SavedWork() {
  const { t, locale } = useT();
  const d = (x: number | string) => new Date(x).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const hydrated = useSchoolHydrated();
  const { lessons, assignments, setLessonState, removeLesson, removeAssignment } = useSchool();
  if (!hydrated) return null;
  return (
    <section className="card grid content-start gap-4 p-5 sm:p-6" aria-labelledby="sw-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 id="sw-title" className="h-section">{t('teacher.sw.title')}</h2><p className="text-sm text-muted">{t(LOCAL_NOTE_KEY)}</p></div>
      </div>
      {!lessons.length && !assignments.length ? (
        <Empty title={t('teacher.sw.emptyTitle')} icon={<EmptyArt kind="saved" size={56} />}>{t('teacher.sw.emptyBody')}</Empty>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-2">
            <p className="eyebrow">{t('teacher.sw.lessons', { n: lessons.length })}</p>
            {lessons.map(l => (
              <div key={l.id} className="grid gap-2 rounded-ctl border border-line p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1"><b className="block truncate">{l.topic}</b><span className="text-xs text-muted">{t('shell.class', { n: l.cls })} · {l.subject} · {d(l.savedAt)}</span></div>
                  <button className="btn-icon h-8 w-8" aria-label={t('teacher.sw.delLesson', { t: l.topic })} onClick={() => removeLesson(l.id)}><Trash2 size={14} /></button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ReviewSteps state={l.state} />
                  <div className="ml-auto flex gap-1.5">
                    {l.state === 'draft' && <button className="btn-soft min-h-8 px-3 py-1 text-xs" onClick={() => setLessonState(l.id, 'review')}>{t('teacher.lb.sendReview')}</button>}
                    {l.state === 'review' && <button className="btn-board min-h-8 px-3 py-1 text-xs" onClick={() => setLessonState(l.id, 'approved')}>{t('teacher.am.approve')}</button>}
                    {l.state !== 'draft' && <button className="btn-ghost min-h-8 px-3 py-1 text-xs" onClick={() => setLessonState(l.id, l.state === 'approved' ? 'review' : 'draft')}>{t('teacher.sw.stepBack')}</button>}
                  </div>
                </div>
              </div>
            ))}
            {!lessons.length && <p className="text-sm text-muted">{t('teacher.sw.noLessons')}</p>}
          </div>
          <div className="grid content-start gap-2">
            <p className="eyebrow">{t('teacher.sw.assignments', { n: assignments.length })}</p>
            {assignments.map(a => {
              const late = a.due < new Date().toISOString().slice(0, 10);
              return (
                <div key={a.id} className="flex items-start gap-2 rounded-ctl border border-line p-3">
                  <div className="min-w-0 flex-1">
                    <b className="block truncate">{a.topic}</b>
                    <span className="text-xs text-muted">{a.section} · {t('teacher.sw.qCount', { n: a.questions.length })}</span>
                  </div>
                  <span className={cx('pill', late ? 'bg-surface2 text-muted' : 'bg-teal/12 text-teal')}>{t('teacher.sw.due', { date: d(a.due) })}</span>
                  <button className="btn-icon h-8 w-8" aria-label={t('teacher.sw.delAssign', { t: a.topic })} onClick={() => removeAssignment(a.id)}><Trash2 size={14} /></button>
                </div>
              );
            })}
            {!assignments.length && <p className="text-sm text-muted">{t('teacher.sw.noAssign')}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
