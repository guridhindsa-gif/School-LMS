import { PACKS } from './registry';

const PACK_ART: Record<string, JSX.Element> = Object.assign({}, ...PACKS.map(p => p.art || {}));

/** Small, purposeful illustration for each lab card (decorative; the card text carries the meaning). */
export function LabArt({ id, className = '' }: { id: string; className?: string }) {
  const p = 'rgb(var(--primary))', t = 'rgb(var(--teal))', a = 'rgb(var(--accent))', n = 'rgb(var(--on-night))';
  const art: Record<string, JSX.Element> = {
    counting: <>{[18, 34, 50].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 26 : 30} r="7" fill={a} />)}<path d="M8 38h52l-6 12H14z" fill={t} opacity=".85" /></>,
    fractions: <><circle cx="34" cy="32" r="20" fill={a} opacity=".3" /><path d="M34 32V12a20 20 0 0 1 20 20z" fill={a} /><path d="M34 32h20a20 20 0 0 1-20 20z" fill={a} /><path d="M34 32v20a20 20 0 0 1-20-20z" fill={a} /><circle cx="34" cy="32" r="20" fill="none" stroke={n} strokeOpacity=".5" /></>,
    refraction: <><rect x="6" y="32" width="56" height="22" fill={p} opacity=".35" /><line x1="34" y1="6" x2="34" y2="58" stroke={n} strokeDasharray="3 3" strokeOpacity=".5" /><path d="M12 10 34 32 44 54" stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    projectile: <><line x1="6" y1="52" x2="62" y2="52" stroke={t} strokeWidth="2" /><path d="M10 52Q34 0 58 52" stroke={a} strokeWidth="3" fill="none" strokeDasharray="4 4" /><circle cx="34" cy="26" r="4.5" fill={n} /></>,
    waves: <><path d="M6 32c6-18 12-18 18 0s12 18 18 0 12-18 18 0" stroke={t} strokeWidth="3" fill="none" strokeLinecap="round" /><line x1="6" y1="32" x2="62" y2="32" stroke={n} strokeOpacity=".3" /></>,
    grapher: <><line x1="34" y1="6" x2="34" y2="58" stroke={n} strokeOpacity=".4" /><line x1="6" y1="40" x2="62" y2="40" stroke={n} strokeOpacity=".4" /><path d="M12 10Q34 70 56 10" stroke={p} strokeWidth="3" fill="none" /><circle cx="21" cy="40" r="3.5" fill={a} /><circle cx="47" cy="40" r="3.5" fill={a} /></>,
    circuit: <><rect x="10" y="14" width="48" height="36" rx="3" fill="none" stroke={n} strokeOpacity=".7" strokeWidth="2.5" /><path d="M24 14l3-5 4 10 4-10 4 10 3-5" stroke={n} strokeWidth="2.5" fill="none" /><circle cx="34" cy="50" r="6" fill={a} />{[14, 58].map(x => <circle key={x} cx={x} cy="32" r="2.5" fill={p} />)}</>,
  };
  return (
    <svg viewBox="0 0 68 64" className={className} aria-hidden focusable="false">
      {art[id] ?? PACK_ART[id] ?? <circle cx="34" cy="32" r="16" fill={p} />}
    </svg>
  );
}
