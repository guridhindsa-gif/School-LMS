'use client';
import { motion, useReducedMotion } from 'framer-motion';

/** Animated chalkboard for the landing page: a projectile arc, a refracted ray and a growing mastery ring. */
export function HeroBoard() {
  const reduce = useReducedMotion();
  const draw = (d = 0) => (reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.6, delay: d, ease: 'easeInOut' as const } });
  return (
    <div className="chalkboard relative aspect-[4/3] w-full overflow-hidden rounded-[1.6rem] border-[10px] border-[#7a5a32] shadow-lift">
      <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Chalkboard sketch of a projectile path, light refracting through glass and a mastery ring">
        <g stroke="rgb(var(--chalk))" fill="none" strokeLinecap="round" opacity=".9">
          <motion.path d="M30 240 Q 120 40 210 240" strokeWidth="3" strokeDasharray="1 0" {...draw(0.2)} />
          <line x1="20" y1="240" x2="230" y2="240" strokeWidth="2" opacity=".6" />
          <motion.circle cx="120" cy="140" r="7" fill="rgb(var(--marigold))" stroke="none"
            animate={reduce ? {} : { offsetDistance: ['0%', '100%'] }} style={{ offsetPath: 'path("M30 240 Q 120 40 210 240")' } as React.CSSProperties}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.8, ease: 'linear' }} />
          <text x="40" y="270" fontSize="14" fill="rgb(var(--chalk))" stroke="none" fontFamily="Mukta">R = u² sin 2θ / g</text>
        </g>
        <g>
          <rect x="250" y="150" width="130" height="90" fill="rgb(160 210 240 / .18)" stroke="rgb(var(--chalk))" strokeOpacity=".5" />
          <line x1="300" y1="70" x2="300" y2="260" stroke="rgb(var(--chalk))" strokeDasharray="4 5" opacity=".5" />
          <motion.path d="M250 80 L300 150 L325 240" stroke="rgb(var(--marigold))" strokeWidth="3.5" fill="none" {...draw(0.6)} />
          <text x="306" y="200" fontSize="13" fill="rgb(var(--chalk))" fontFamily="Mukta">n = 1.5</text>
        </g>
        <g transform="translate(330 60)">
          <circle r="30" fill="none" stroke="rgb(255 255 255 / .15)" strokeWidth="7" />
          <motion.circle r="30" fill="none" stroke="rgb(var(--marigold))" strokeWidth="7" strokeLinecap="round" transform="rotate(-90)"
            initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 0.78 }} transition={{ duration: 1.8, delay: 1 }} />
          <text textAnchor="middle" y="6" fontSize="16" fontWeight="700" fill="rgb(var(--chalk))" fontFamily="Baloo 2">78%</text>
        </g>
        <text x="30" y="40" fontSize="20" fontWeight="700" fill="rgb(var(--chalk))" fontFamily="Baloo 2">Learn it. See it. Master it.</text>
      </svg>
    </div>
  );
}
