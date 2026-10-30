/**
 * School LMS illustration system.
 * Flat, rounded shapes drawn only with design tokens (rgb(var(--…))) so every picture adapts to
 * light/dark themes. Decorative by default (aria-hidden); pass `title` to make one meaningful.
 * Replaces emoji in the interface; AI-generated lesson content may still contain emoji.
 */
import { Award, Compass, Flame, Lightbulb, Medal, Sprout, Target, Trophy, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const C = {
  primary: 'rgb(var(--primary))', teal: 'rgb(var(--teal))', accent: 'rgb(var(--accent))', night: 'rgb(var(--night))',
  night2: 'rgb(var(--night-2))', surface: 'rgb(var(--surface))', s2: 'rgb(var(--surface-2))', s3: 'rgb(var(--surface-3))',
  ink: 'rgb(var(--ink))', line: 'rgb(var(--line))', violet: 'rgb(var(--violet))', good: 'rgb(var(--good))', bad: 'rgb(var(--bad))', white: '#fff',
};

function Svg({ size = 64, title, children, className, vb = '0 0 64 64' }: { size?: number | string; title?: string; children: ReactNode; className?: string; vb?: string }) {
  return (
    <svg viewBox={vb} width={size} height={size} className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {children}
    </svg>
  );
}

/* ---------------- Vidya: a friendly diya (lamp of learning) ---------------- */
export function Vidya({ size = 64, mood = 'happy', className, title }: { size?: number | string; mood?: 'happy' | 'think' | 'cheer'; className?: string; title?: string }) {
  return (
    <Svg size={size} className={className} title={title}>
      <path d="M32 6c5 7 8 11 8 16a8 8 0 0 1-16 0c0-5 3-9 8-16Z" fill={C.accent} />
      <path d="M32 13c2.6 4 4 6.2 4 9a4 4 0 0 1-8 0c0-2.8 1.4-5 4-9Z" fill="#fff4d6" />
      <path d="M8 34h48c0 13-10.7 22-24 22S8 47 8 34Z" fill={C.primary} />
      <path d="M8 34h48c-.4 2.6-1.2 5-2.4 7H10.4C9.2 39 8.4 36.6 8 34Z" fill={C.teal} />
      <ellipse cx="32" cy="34" rx="24" ry="4" fill={C.night2} />
      {mood === 'think'
        ? <><circle cx="24" cy="46" r="2.4" fill={C.white} /><circle cx="40" cy="46" r="2.4" fill={C.white} /><path d="M28 52h8" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" /></>
        : <><path d="M21.5 46.5q2.5-3 5 0" stroke={C.white} strokeWidth="2.4" fill="none" strokeLinecap="round" /><path d="M37.5 46.5q2.5-3 5 0" stroke={C.white} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d={mood === 'cheer' ? 'M26 50q6 6 12 0Z' : 'M27 51q5 3.5 10 0'} stroke={C.white} strokeWidth="2.4" fill={mood === 'cheer' ? C.white : 'none'} strokeLinecap="round" /></>}
      <circle cx="18" cy="49" r="2.2" fill={C.accent} opacity=".55" /><circle cx="46" cy="49" r="2.2" fill={C.accent} opacity=".55" />
    </Svg>
  );
}

/* ---------------- Subjects ---------------- */
type SubjectKind = 'maths' | 'physics' | 'chemistry' | 'biology' | 'science' | 'english' | 'hindi' | 'punjabi' | 'evs' | 'social' | 'computer' | 'arts' | 'pe' | 'commerce' | 'language' | 'general';

export function subjectKind(name: string): SubjectKind {
  const n = name.toLowerCase();
  if (/math/.test(n)) return 'maths';
  if (/physics/.test(n)) return 'physics';
  if (/chemistry/.test(n)) return 'chemistry';
  if (/biolog/.test(n)) return 'biology';
  if (/science/.test(n) && !/computer|political|social/.test(n)) return 'science';
  if (/english/.test(n)) return 'english';
  if (/hindi/.test(n)) return 'hindi';
  if (/punjabi/.test(n)) return 'punjabi';
  if (/evs|environment|world around/.test(n)) return 'evs';
  if (/social|history|geograph|civics|political|sociolog|psycholog/.test(n)) return 'social';
  if (/computer|informatic|artificial|\bai\b|\bit\b|coding/.test(n)) return 'computer';
  if (/art|music|dance|drawing/.test(n)) return 'arts';
  if (/physical|health|sport|yoga/.test(n)) return 'pe';
  if (/account|business|econom|commerce|entrepreneur/.test(n)) return 'commerce';
  if (/sanskrit|urdu|french|german|language|literature/.test(n)) return 'language';
  return 'general';
}

export function SubjectArt({ name, size = 56, className }: { name: string; size?: number | string; className?: string }) {
  const k = subjectKind(name);
  const bg = <rect x="2" y="2" width="60" height="60" rx="16" fill={C.s2} />;
  const body: Record<SubjectKind, ReactNode> = {
    maths: <><rect x="12" y="34" width="18" height="18" rx="4" fill={C.primary} /><circle cx="44" cy="22" r="10" fill={C.teal} /><path d="M38 52l8-16 8 16Z" fill={C.accent} /><path d="M15 21h12M21 15v12" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" /></>,
    physics: <><circle cx="32" cy="32" r="5" fill={C.accent} /><ellipse cx="32" cy="32" rx="22" ry="8" fill="none" stroke={C.primary} strokeWidth="3" /><ellipse cx="32" cy="32" rx="22" ry="8" fill="none" stroke={C.teal} strokeWidth="3" transform="rotate(60 32 32)" /><ellipse cx="32" cy="32" rx="22" ry="8" fill="none" stroke={C.violet} strokeWidth="3" transform="rotate(-60 32 32)" /></>,
    chemistry: <><path d="M26 10h12M28 10v14L15 46a5 5 0 0 0 4.3 7.5h25.4A5 5 0 0 0 49 46L36 24V10" fill={C.surface} stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" /><path d="M19 42h26l4 6a4 4 0 0 1-3.4 5.5H18.4A4 4 0 0 1 15 48Z" fill={C.teal} /><circle cx="27" cy="47" r="2.2" fill={C.white} /><circle cx="36" cy="44" r="1.6" fill={C.white} /></>,
    biology: <><path d="M14 50C14 26 30 12 52 12c0 22-14 38-38 38Z" fill={C.good} /><path d="M18 46C26 36 34 28 46 18" stroke={C.white} strokeWidth="2.6" strokeLinecap="round" fill="none" /><circle cx="44" cy="44" r="8" fill={C.accent} opacity=".9" /></>,
    science: <><circle cx="24" cy="38" r="12" fill={C.teal} /><circle cx="24" cy="38" r="5" fill={C.white} /><path d="M40 12l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill={C.accent} /><circle cx="46" cy="46" r="6" fill={C.primary} /></>,
    english: <><path d="M10 16c8-3 15-2 22 3v32c-7-5-14-6-22-3Z" fill={C.primary} /><path d="M54 16c-8-3-15-2-22 3v32c7-5 14-6 22-3Z" fill={C.teal} /><text x="21" y="38" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.white} fontFamily="system-ui">A</text><text x="43" y="38" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.white} fontFamily="system-ui">b</text></>,
    hindi: <><rect x="12" y="12" width="40" height="40" rx="10" fill={C.accent} /><text x="32" y="43" textAnchor="middle" fontSize="28" fontWeight="700" fill={C.night} fontFamily="var(--font-deva), 'Noto Sans Devanagari', sans-serif">अ</text></>,
    punjabi: <><rect x="12" y="12" width="40" height="40" rx="10" fill={C.teal} /><text x="32" y="43" textAnchor="middle" fontSize="28" fontWeight="700" fill={C.white} fontFamily="var(--font-guru), 'Noto Sans Gurmukhi', sans-serif">ੳ</text></>,
    evs: <><circle cx="44" cy="18" r="7" fill={C.accent} /><rect x="27" y="34" width="5" height="18" rx="2" fill={C.night2} /><circle cx="29.5" cy="28" r="12" fill={C.good} /><path d="M8 52h48" stroke={C.teal} strokeWidth="4" strokeLinecap="round" /></>,
    social: <><circle cx="32" cy="32" r="20" fill={C.primary} /><path d="M18 26c6 0 8 4 13 3s6-7 11-6M14 38c7-1 10 4 16 3s9-5 18-3" stroke={C.teal} strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="32" cy="32" r="20" fill="none" stroke={C.ink} strokeWidth="2" opacity=".25" /></>,
    computer: <><rect x="10" y="14" width="44" height="28" rx="5" fill={C.night} /><path d="M22 24l-5 4 5 4M42 24l5 4-5 4M35 21l-6 14" stroke={C.teal} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><rect x="24" y="44" width="16" height="4" rx="2" fill={C.s3} /><rect x="16" y="48" width="32" height="4" rx="2" fill={C.primary} /></>,
    arts: <><path d="M32 10c13 0 22 9 22 19 0 6-5 8-9 8-3 0-5 2-5 5 0 4-3 7-8 7-12 0-22-9-22-20s10-19 22-19Z" fill={C.accent} /><circle cx="22" cy="26" r="4" fill={C.primary} /><circle cx="33" cy="20" r="4" fill={C.teal} /><circle cx="44" cy="26" r="4" fill={C.violet} /><circle cx="22" cy="38" r="4" fill={C.bad} /></>,
    pe: <><circle cx="32" cy="32" r="20" fill={C.surface} stroke={C.ink} strokeWidth="2.4" /><path d="M32 12v40M12 32h40M18 18c6 6 6 22 0 28M46 18c-6 6-6 22 0 28" stroke={C.accent} strokeWidth="2.6" fill="none" /></>,
    commerce: <><rect x="12" y="36" width="9" height="16" rx="2" fill={C.teal} /><rect x="27" y="26" width="9" height="26" rx="2" fill={C.primary} /><rect x="42" y="16" width="9" height="36" rx="2" fill={C.accent} /><path d="M12 28l14-10 10 6 16-12" stroke={C.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".6" /></>,
    language: <><path d="M10 14h30a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H24l-9 8v-8h-5a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" fill={C.primary} /><path d="M54 26h-4v14a8 8 0 0 1-8 8H32l-2 2h12l8 7v-7h4a4 4 0 0 0 4-4V30a4 4 0 0 0-4-4Z" fill={C.teal} /></>,
    general: <><path d="M12 16c7-3 13-2 20 3v32c-7-5-13-6-20-3Z" fill={C.primary} /><path d="M52 16c-7-3-13-2-20 3v32c7-5 13-6 20-3Z" fill={C.teal} /><circle cx="46" cy="12" r="4" fill={C.accent} /></>,
  };
  return <Svg size={size} className={className}>{bg}{body[k]}</Svg>;
}

/* ---------------- Junior destinations ---------------- */
export function DestinationArt({ kind, size = 120, className }: { kind: 'learn' | 'play' | 'stars' | 'vidya'; size?: number | string; className?: string }) {
  const v = '0 0 120 120';
  if (kind === 'vidya') return <Vidya size={size} mood="cheer" className={className} />;
  return (
    <Svg size={size} vb={v} className={className}>
      {kind === 'learn' && <>
        <circle cx="60" cy="64" r="46" fill={C.primary} opacity=".14" />
        <path d="M18 40c14-6 28-4 42 6v52c-14-10-28-12-42-6Z" fill={C.primary} />
        <path d="M102 40c-14-6-28-4-42 6v52c14-10 28-12 42-6Z" fill={C.teal} />
        <path d="M28 54c8-2 15-1 22 3M28 66c8-2 15-1 22 3M70 57c7-4 14-5 22-3M70 69c7-4 14-5 22-3" stroke={C.white} strokeWidth="3.4" strokeLinecap="round" opacity=".8" />
        <path d="M60 10l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill={C.accent} />
        <circle cx="92" cy="22" r="5" fill={C.accent} opacity=".7" /><circle cx="24" cy="26" r="4" fill={C.teal} opacity=".7" />
      </>}
      {kind === 'play' && <>
        <circle cx="60" cy="64" r="46" fill={C.teal} opacity=".16" />
        <path d="M48 16h24M51 16v26L28 86a9 9 0 0 0 8 13h48a9 9 0 0 0 8-13L69 42V16" fill={C.surface} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
        <path d="M35 74h50l7 13a8 8 0 0 1-7 12H36a8 8 0 0 1-7-12Z" fill={C.teal} />
        <circle cx="50" cy="86" r="4" fill={C.white} /><circle cx="66" cy="80" r="3" fill={C.white} /><circle cx="60" cy="58" r="3.4" fill={C.teal} /><circle cx="66" cy="46" r="2.4" fill={C.teal} />
        <circle cx="96" cy="30" r="9" fill={C.accent} /><rect x="14" y="32" width="14" height="14" rx="3" fill={C.primary} transform="rotate(-14 21 39)" />
      </>}
      {kind === 'stars' && <>
        <circle cx="60" cy="64" r="46" fill={C.accent} opacity=".2" />
        <path d="M40 30h40v18a20 20 0 0 1-40 0Z" fill={C.accent} />
        <path d="M40 36H28a10 10 0 0 0 12 14M80 36h12a10 10 0 0 1-12 14" stroke={C.accent} strokeWidth="5" fill="none" />
        <rect x="54" y="66" width="12" height="14" fill={C.accent} /><rect x="42" y="80" width="36" height="10" rx="4" fill={C.primary} />
        <path d="M60 36l3 6 6.5 1-4.7 4.5 1.1 6.5L60 51l-5.9 3 1.1-6.5L50.5 43l6.5-1Z" fill={C.white} />
        <path d="M22 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill={C.teal} /><path d="M98 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill={C.primary} />
      </>}
    </Svg>
  );
}

/* ---------------- Badges: consistent icon medals instead of emoji ---------------- */
const BADGE_ICON: Record<string, LucideIcon> = { first: Sprout, ten: Target, streak3: Flame, streak7: Medal, strong: Lightbulb, explorer: Compass, fifty: Award, master5: Trophy };
const BADGE_TONE: Record<string, string> = { first: C.good, ten: C.primary, streak3: C.accent, streak7: C.violet, strong: C.accent, explorer: C.teal, fifty: C.primary, master5: C.accent };

export function BadgeMedal({ id, earned, size = 48 }: { id: string; earned: boolean; size?: number }) {
  const Icon = BADGE_ICON[id] || Award;
  const tone = earned ? BADGE_TONE[id] || C.primary : C.s3;
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size} className="absolute inset-0">
        <circle cx="24" cy="24" r="22" fill={tone} opacity={earned ? 0.16 : 1} />
        <circle cx="24" cy="24" r="16" fill={earned ? tone : C.s2} />
        {earned && <circle cx="24" cy="24" r="22" fill="none" stroke={tone} strokeWidth="2" strokeDasharray="3 4" />}
      </svg>
      <Icon size={size * 0.38} className="relative" color={earned ? '#fff' : 'rgb(var(--muted))'} strokeWidth={2.4} />
    </span>
  );
}

/* ---------------- Stars ---------------- */
export function Star({ size = 24, filled = true, className }: { size?: number; filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z" fill={filled ? C.accent : 'none'} stroke={filled ? C.accent : 'rgb(var(--line))'} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Empty states ---------------- */
export function EmptyArt({ kind = 'general', size = 120 }: { kind?: 'progress' | 'saved' | 'search' | 'activity' | 'general'; size?: number }) {
  return (
    <Svg size={size} vb="0 0 120 120">
      <ellipse cx="60" cy="100" rx="40" ry="6" fill={C.s3} />
      {kind === 'progress' && <><rect x="26" y="58" width="14" height="36" rx="4" fill={C.s3} /><rect x="46" y="44" width="14" height="50" rx="4" fill={C.primary} opacity=".35" /><rect x="66" y="30" width="14" height="64" rx="4" fill={C.teal} opacity=".45" /><path d="M86 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill={C.accent} /></>}
      {kind === 'saved' && <><rect x="30" y="24" width="60" height="70" rx="8" fill={C.surface} stroke={C.line} strokeWidth="3" /><path d="M42 44h36M42 56h36M42 68h22" stroke={C.s3} strokeWidth="5" strokeLinecap="round" /><circle cx="86" cy="80" r="12" fill={C.primary} /><path d="M80 80l4 4 8-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" /></>}
      {kind === 'search' && <><circle cx="54" cy="54" r="24" fill={C.surface} stroke={C.primary} strokeWidth="6" /><path d="M72 72l18 18" stroke={C.primary} strokeWidth="8" strokeLinecap="round" /><path d="M46 50q8-8 16 0" stroke={C.s3} strokeWidth="4" fill="none" strokeLinecap="round" /></>}
      {kind === 'activity' && <><rect x="22" y="36" width="76" height="56" rx="10" fill={C.surface} stroke={C.line} strokeWidth="3" />{[0, 1, 2, 3, 4, 5, 6].map(i => <rect key={i} x={30 + i * 9.6} y={72 - (i % 3) * 6} width="6" height={14 + (i % 3) * 6} rx="2" fill={i === 6 ? C.primary : C.s3} />)}<path d="M84 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill={C.accent} /></>}
      {kind === 'general' && <g transform="translate(28 24)"><Vidya size={64} mood="think" /></g>}
    </Svg>
  );
}
