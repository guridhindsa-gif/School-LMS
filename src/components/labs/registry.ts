export interface LabInfo {
  id: string;
  title: string;
  blurb: string;
  subject: 'Maths' | 'Physics';
  classes: string;
  /** lowest and highest class the lab is designed for */
  min: number;
  max: number;
  /** the idea the lab makes visible */
  concept: string;
  /** short "try this" challenges shown beside the lab */
  tries: string[];
}

export const LABS: LabInfo[] = [
  { id: 'counting', title: 'Count the mangoes', blurb: 'Mangoes drop into a basket. Tap how many you see.', subject: 'Maths', classes: 'Classes 1–2', min: 1, max: 2, concept: 'Counting objects up to 9',
    tries: ['Point at each mango as you count it.', 'Earn all five stars.', 'Tap Listen to hear the question again.'] },
  { id: 'fractions', title: 'Share the roti', blurb: 'Cut a roti into equal parts and shade a fraction.', subject: 'Maths', classes: 'Classes 3–6', min: 3, max: 6, concept: 'Equivalent fractions',
    tries: ['Shade 3/4 with 4 parts, then with 8 parts.', 'Find a number of parts where 3/4 is impossible.', 'Watch the decimal and percent change as you shade.'] },
  { id: 'refraction', title: 'Bending light', blurb: "Change the angle and material and watch Snell's law, including total internal reflection.", subject: 'Physics', classes: 'Classes 8–12', min: 8, max: 12, concept: "Snell's law and total internal reflection",
    tries: ['Air → Glass: does the ray bend towards or away from the normal?', 'Glass → Air: raise the angle until light stops escaping.', 'Compare the critical angle of glass and diamond.'] },
  { id: 'projectile', title: 'Projectile launcher', blurb: 'Aim and launch. Read off range, height and time of flight live.', subject: 'Physics', classes: 'Classes 9–12 · JEE/NEET', min: 9, max: 13, concept: 'Projectile motion under gravity',
    tries: ['Launch at 30° and at 60°. Where do they land?', 'Find the angle with the greatest range from the ground.', 'Add launch height. Is 45° still the best angle?'] },
  { id: 'waves', title: 'Oscillations & waves', blurb: 'A spring–mass oscillator draws its own sine graph.', subject: 'Physics', classes: 'Classes 9–12', min: 9, max: 13, concept: 'Simple harmonic motion',
    tries: ['Double the mass. What happens to the period?', 'Change the amplitude. Does the period change?', 'Add damping and watch the graph shrink.'] },
  { id: 'grapher', title: 'Function grapher', blurb: 'Slide coefficients of quadratics and trig functions; see roots and vertex move.', subject: 'Maths', classes: 'Classes 9–12', min: 9, max: 13, concept: 'How coefficients shape a graph',
    tries: ['Make the discriminant negative. What happens to the roots?', 'Make a = 0 for the quadratic.', 'Switch to sine and halve the period.'] },
  { id: 'circuit', title: "Ohm's law circuit", blurb: 'Set voltage and resistors in series or parallel; electrons speed up with current.', subject: 'Physics', classes: 'Classes 8–12', min: 8, max: 12, concept: "Ohm's law in series and parallel",
    tries: ['Switch to parallel. Does the bulb get brighter?', 'Make R₁ = R₂ in parallel. What is the total resistance?', 'Double the voltage and watch the current.'] },
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
