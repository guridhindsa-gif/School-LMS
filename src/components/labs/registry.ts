import type { LabInfo } from './types';
import { primary } from './packs/primary';
import { middle } from './packs/middle';
import { science } from './packs/science';
import { senior } from './packs/senior';

export type { LabInfo, LabSubject } from './types';

const CORE: LabInfo[] = [
  { id: 'counting', match: /numbers? (and place value|up to|from)|counting|how many|numbers\b/i, title: 'Count the mangoes', blurb: 'Mangoes drop into a basket. Tap how many you see.', subject: 'Maths', classes: 'Classes 1–2', min: 1, max: 2, concept: 'Counting objects up to 9',
    tries: ['Point at each mango as you count it.', 'Earn all five stars.', 'Tap Listen to hear the question again.'] },
  { id: 'fractions', match: /fraction/i, title: 'Share the roti', blurb: 'Cut a roti into equal parts and shade a fraction.', subject: 'Maths', classes: 'Classes 3–6', min: 3, max: 6, concept: 'Equivalent fractions',
    tries: ['Shade 3/4 with 4 parts, then with 8 parts.', 'Find a number of parts where 3/4 is impossible.', 'Watch the decimal and percent change as you shade.'] },
  { id: 'refraction', match: /light|refraction|ray optics|optics|lens/i, title: 'Bending light', blurb: "Change the angle and material and watch Snell's law, including total internal reflection.", subject: 'Physics', classes: 'Classes 8–12', min: 8, max: 12, concept: "Snell's law and total internal reflection",
    tries: ['Air → Glass: does the ray bend towards or away from the normal?', 'Glass → Air: raise the angle until light stops escaping.', 'Compare the critical angle of glass and diamond.'] },
  { id: 'projectile', match: /projectile|kinematics|motion in a plane|motion in two/i, tag: 'JEE/NEET', title: 'Projectile launcher', blurb: 'Aim and launch. Read off range, height and time of flight live.', subject: 'Physics', classes: 'Classes 9–12 · JEE/NEET', min: 9, max: 13, concept: 'Projectile motion under gravity',
    tries: ['Launch at 30° and at 60°. Where do they land?', 'Find the angle with the greatest range from the ground.', 'Add launch height. Is 45° still the best angle?'] },
  { id: 'waves', match: /oscillation|waves?\b|sound|simple harmonic|shm/i, title: 'Oscillations & waves', blurb: 'A spring–mass oscillator draws its own sine graph.', subject: 'Physics', classes: 'Classes 9–12', min: 9, max: 13, concept: 'Simple harmonic motion',
    tries: ['Double the mass. What happens to the period?', 'Change the amplitude. Does the period change?', 'Add damping and watch the graph shrink.'] },
  { id: 'grapher', match: /quadratic|polynomial|functions|trigonometr|graph|coordinate|linear equations?/i, title: 'Function grapher', blurb: 'Slide coefficients of quadratics and trig functions; see roots and vertex move.', subject: 'Maths', classes: 'Classes 9–12', min: 9, max: 13, concept: 'How coefficients shape a graph',
    tries: ['Make the discriminant negative. What happens to the roots?', 'Make a = 0 for the quadratic.', 'Switch to sine and halve the period.'] },
  { id: 'circuit', match: /electric|current|ohm|circuit/i, title: "Ohm's law circuit", blurb: 'Set voltage and resistors in series or parallel; electrons speed up with current.', subject: 'Physics', classes: 'Classes 8–12', min: 8, max: 12, concept: "Ohm's law in series and parallel",
    tries: ['Switch to parallel. Does the bulb get brighter?', 'Make R₁ = R₂ in parallel. What is the total resistance?', 'Double the voltage and watch the current.'] },
];


export const PACKS = [primary, middle, science, senior];

/** Every lab: the original seven plus the class-wise packs, ordered by starting class. */
export const LABS: LabInfo[] = [...CORE, ...PACKS.flatMap(p => p.labs)].sort((a, b) => a.min - b.min || a.max - b.max);

/** The lab that best fits a chapter: name match, preferring labs designed for that class. */
export function labFor(name: string, cls?: number): LabInfo | null {
  const hits = LABS.filter(l => l.match?.test(name));
  if (!hits.length) return null;
  if (!cls) return hits[0];
  const fit = (l: LabInfo) => (cls >= l.min && cls <= l.max ? 0 : Math.min(Math.abs(cls - l.min), Math.abs(cls - l.max)));
  const best = hits.sort((a, b) => fit(a) - fit(b))[0];
  return fit(best) <= 2 ? best : null;
}

/** All labs for a chapter (best first), for "more labs" links. */
export function labsFor(name: string, cls?: number): LabInfo[] {
  const hits = LABS.filter(l => l.match?.test(name) && (!cls || (cls >= l.min - 1 && cls <= l.max + 1)));
  return hits.sort((a, b) => Math.abs((cls ?? a.min) - a.min) - Math.abs((cls ?? b.min) - b.min));
}
