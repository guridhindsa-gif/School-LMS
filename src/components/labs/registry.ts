export interface LabInfo { id: string; title: string; blurb: string; subject: string; classes: string }

export const LABS: LabInfo[] = [
  { id: 'counting', title: 'Count the mangoes', blurb: 'Mangoes drop into a basket. Tap how many you see.', subject: 'Maths', classes: 'Classes 1–2' },
  { id: 'fractions', title: 'Share the roti', blurb: 'Cut a roti into equal parts and shade a fraction.', subject: 'Maths', classes: 'Classes 3–6' },
  { id: 'refraction', title: 'Bending light', blurb: "Change the angle and material and watch Snell's law, including total internal reflection.", subject: 'Physics', classes: 'Classes 8–12' },
  { id: 'projectile', title: 'Projectile launcher', blurb: 'Aim and launch. Read off range, height and time of flight live.', subject: 'Physics', classes: 'Classes 9–12 · JEE/NEET' },
  { id: 'waves', title: 'Oscillations & waves', blurb: 'A spring–mass oscillator draws its own sine graph.', subject: 'Physics', classes: 'Classes 9–12' },
  { id: 'grapher', title: 'Function grapher', blurb: 'Slide coefficients of quadratics and trig functions; see roots and vertex move.', subject: 'Maths', classes: 'Classes 9–12' },
  { id: 'circuit', title: "Ohm's law circuit", blurb: 'Set voltage and resistors in series or parallel; electrons speed up with current.', subject: 'Physics', classes: 'Classes 8–12' },
];

const RULES: [RegExp, string, (c?: number) => boolean][] = [
  [/fraction/i, 'fractions', c => !c || c <= 8],
  [/numbers? (and place value|up to|from)|counting|how many|numbers\b/i, 'counting', c => !!c && c <= 3],
  [/light|refraction|ray optics|optics|lens/i, 'refraction', () => true],
  [/projectile|kinematics|motion in a plane|motion in two/i, 'projectile', () => true],
  [/oscillation|waves?\b|sound|simple harmonic|shm/i, 'waves', () => true],
  [/quadratic|polynomial|functions|trigonometr|graph|coordinate|linear equations?/i, 'grapher', c => !c || c >= 9],
  [/electric|current|ohm|circuit/i, 'circuit', () => true],
];

export function labFor(name: string, cls?: number): LabInfo | null {
  for (const [re, id, ok] of RULES) if (re.test(name) && ok(cls)) return LABS.find(l => l.id === id) || null;
  return null;
}
