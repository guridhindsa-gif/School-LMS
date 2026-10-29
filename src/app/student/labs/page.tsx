'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { LABS } from '@/components/labs/registry';
import { LabView } from '@/components/labs/LabView';
import { Reveal, cx } from '@/components/ui';
import { useTutor } from '@/lib/tutor-store';

function Labs() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('lab') || 'refraction';
  const lab = LABS.find(l => l.id === id) || LABS[2];
  const { setContext, ask } = useTutor();
  useEffect(() => { setContext({ kind: 'board', subject: lab.subject, unit: lab.title, topics: [lab.blurb] }, `Lab: ${lab.title}`); }, [lab, setContext]);

  return (
    <div className="grid gap-6">
      <Reveal>
        <p className="eyebrow">Visual labs</p>
        <h1 className="text-3xl">See it move</h1>
        <p className="max-w-2xl text-muted">Interactive simulations linked to your chapters. Change a value and watch the idea respond.</p>
      </Reveal>
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Labs">
        {LABS.map(l => (
          <button key={l.id} role="tab" aria-selected={l.id === lab.id} onClick={() => router.replace(`/student/labs?lab=${l.id}`, { scroll: false })}
            className={cx('relative shrink-0 rounded-xl px-4 py-2 text-left transition', l.id === lab.id ? 'text-chalk' : 'bg-surface text-ink hover:bg-surface2')}>
            {l.id === lab.id && <motion.span layoutId="lab-tab" className="absolute inset-0 rounded-xl bg-board" />}
            <span className="relative block font-semibold">{l.title}</span>
            <span className={cx('relative block text-xs', l.id === lab.id ? 'text-chalk/75' : 'text-muted')}>{l.subject} · {l.classes}</span>
          </button>
        ))}
      </div>
      <motion.section key={lab.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card grid gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-2xl">{lab.title}</h2><p className="text-muted">{lab.blurb}</p></div>
          <button className="btn-ghost" onClick={() => ask(`I'm using the "${lab.title}" lab. Can you give me a question to test my understanding?`)}><Sparkles size={16} className="text-marigold" /> Ask the tutor about this</button>
        </div>
        <LabView id={lab.id} />
      </motion.section>
    </div>
  );
}

export default function LabsPage() {
  return <Suspense><Labs /></Suspense>;
}
