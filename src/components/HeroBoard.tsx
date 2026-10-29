'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

/**
 * Landing-page product illustration: a lesson-studio scene (projectile lab), the tutor giving a hint,
 * and an adaptive-practice card. Purely illustrative — no real learner data.
 */
export function HeroBoard() {
  const reduce = useReducedMotion();
  const draw = (d = 0) => (reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.4, delay: d, ease: 'easeInOut' as const } });
  const float = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } });
  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-10 pt-4 sm:pb-6" role="img" aria-label="Illustration of the lesson studio: a projectile simulation, a hint from the AI tutor and an adaptive practice card">
      {/* main stage */}
      <div className="panel-night relative overflow-hidden rounded-[1.75rem] p-4 shadow-float ring-1 ring-white/10 sm:p-5">
        <div className="flex items-center gap-2 text-xs text-onnight/70">
          <span className="flex gap-1" aria-hidden><i className="h-2.5 w-2.5 rounded-full bg-white/20" /><i className="h-2.5 w-2.5 rounded-full bg-white/20" /><i className="h-2.5 w-2.5 rounded-full bg-white/20" /></span>
          <span className="ml-2 font-mono">Physics · Kinematics · Explore</span>
        </div>
        <svg viewBox="0 0 400 230" className="mt-3 w-full" aria-hidden>
          <defs>
            <linearGradient id="hb-ground" x1="0" x2="1"><stop offset="0" stopColor="rgb(var(--teal))" stopOpacity=".5" /><stop offset="1" stopColor="rgb(var(--primary))" stopOpacity=".5" /></linearGradient>
          </defs>
          {[40, 80, 120, 160].map(y => <line key={y} x1="20" x2="390" y1={y} y2={y} stroke="white" strokeOpacity=".06" />)}
          <line x1="20" y1="200" x2="390" y2="200" stroke="url(#hb-ground)" strokeWidth="3" />
          <motion.path d="M30 200 Q 130 10 250 200" stroke="rgb(var(--on-night))" strokeOpacity=".35" strokeWidth="2" strokeDasharray="5 6" fill="none" {...draw(0.2)} />
          <motion.path d="M30 200 Q 175 -30 340 200" stroke="rgb(var(--accent))" strokeWidth="3" fill="none" strokeLinecap="round" {...draw(0.6)} />
          <motion.circle r="7" fill="rgb(var(--accent))"
            animate={reduce ? {} : { offsetDistance: ['0%', '100%'] }} style={{ offsetPath: 'path("M30 200 Q 175 -30 340 200")' } as React.CSSProperties}
            transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1, ease: 'linear' }} cx={reduce ? 175 : 0} cy={reduce ? 85 : 0} />
          <g fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="rgb(var(--on-night))">
            <text x="236" y="218" opacity=".6">30°</text>
            <text x="326" y="218">45°</text>
          </g>
        </svg>
        <div className="mt-1 grid grid-cols-3 gap-2 text-center">
          {[['Angle', '45°'], ['Speed', '20 m/s'], ['Range', '40.8 m']].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/[.07] px-2 py-2"><p className="text-[11px] text-onnight/60">{k}</p><p className="font-mono text-sm font-semibold text-onnight">{v}</p></div>
          ))}
        </div>
      </div>

      {/* tutor hint */}
      <motion.div {...float(0.9)} className="absolute -left-2 top-[58%] w-[62%] max-w-[300px] rounded-2xl border border-line bg-surface p-3 shadow-lift sm:-left-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-onprimary"><Sparkles size={12} /></span>Vidya · Guide me</div>
        <p className="mt-1.5 text-sm leading-snug">Both 30° and 60° land at the same spot. <b>What do they add up to?</b></p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted"><Lightbulb size={12} className="text-accent" /> A hint, not the answer</p>
      </motion.div>

      {/* adaptive card */}
      <motion.div {...float(1.2)} className="absolute -right-2 -top-2 w-[44%] max-w-[210px] rounded-2xl border border-line bg-surface p-3 shadow-lift sm:-right-6">
        <p className="eyebrow !text-[0.62rem]">Next question</p>
        <p className="mt-1 text-sm font-semibold leading-snug">Pitched at your level</p>
        <div className="mt-2 flex gap-1" aria-hidden>
          {['bg-good', 'bg-good', 'bg-primary', 'bg-surface3'].map((c, i) => <i key={i} className={`h-1.5 flex-1 rounded-full ${c}`} />)}
        </div>
        <p className="mt-1.5 text-[11px] text-muted">Easy → medium → hard as you improve</p>
      </motion.div>
    </div>
  );
}
