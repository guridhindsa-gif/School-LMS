import { z } from 'zod';
import { tryCompile } from './expr';

/** A visual lesson is a short sequence of animated, interactive scenes. */
const s = z.string().min(1).max(220);
const short = z.string().min(1).max(60);
const emoji = z.string().max(16).optional().catch(undefined);
const item = z.object({ label: short, emoji, detail: z.string().max(260).optional().catch(undefined) });
const base = { title: z.string().min(1).max(90), narration: z.string().max(420).default('') };

export const SceneSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('intro'), ...base, emoji, bullets: z.array(s).max(4).default([]) }),
  z.object({ type: z.literal('concept_map'), ...base, center: item, nodes: z.array(item).min(2).max(7) }),
  z.object({ type: z.literal('steps'), ...base, steps: z.array(item).min(2).max(8) }),
  z.object({ type: z.literal('cycle'), ...base, stages: z.array(item).min(3).max(7) }),
  z.object({ type: z.literal('compare'), ...base, columns: z.array(z.object({ heading: short, emoji, points: z.array(s).min(1).max(6) })).min(2).max(3) }),
  z.object({ type: z.literal('sort'), ...base, buckets: z.array(short).min(2).max(3), items: z.array(z.object({ label: short, emoji, bucket: z.coerce.number().int().min(0) })).min(3).max(10) }),
  z.object({ type: z.literal('hotspot'), ...base, emoji: z.string().max(16), label: short, parts: z.array(z.object({ label: short, detail: z.string().max(260) })).min(2).max(6) }),
  z.object({
    type: z.literal('formula'), ...base,
    expression: z.string().min(1).max(200), display: z.string().max(200).optional().catch(undefined),
    result: z.object({ symbol: z.string().max(12), label: short, unit: z.string().max(16).default('') }),
    variables: z.array(z.object({ symbol: z.string().max(12), label: short, unit: z.string().max(16).default(''), min: z.coerce.number(), max: z.coerce.number(), step: z.coerce.number().positive().default(1), value: z.coerce.number() })).min(1).max(4),
    degrees: z.boolean().default(true),
  }),
  z.object({ type: z.literal('timeline'), ...base, events: z.array(z.object({ when: short, title: short, detail: z.string().max(260).optional().catch(undefined), emoji })).min(2).max(8) }),
  z.object({ type: z.literal('flashcards'), ...base, cards: z.array(z.object({ front: short, back: z.string().min(1).max(260), emoji })).min(2).max(8) }),
  z.object({ type: z.literal('order'), ...base, items: z.array(short).min(3).max(7) }),
  z.object({ type: z.literal('quiz'), ...base, q: z.string().min(3).max(300), options: z.array(short).min(2).max(4), answer: z.coerce.number().int().min(0), explanation: z.string().max(400).default('') }),
  z.object({ type: z.literal('lab'), ...base, lab: z.string().max(30) }),
]);
export type Scene = z.infer<typeof SceneSchema>;
export type SceneType = Scene['type'];
export interface VisualLesson { title: string; scenes: Scene[] }

/** Validates scenes one by one, dropping (not failing on) bad ones, and checks formulas and indices. */
export function sanitizeLesson(raw: unknown): VisualLesson {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as { title?: unknown; scenes?: unknown[] };
  const scenes: Scene[] = [];
  for (const r of Array.isArray(obj.scenes) ? obj.scenes : []) {
    const p = SceneSchema.safeParse(r);
    if (!p.success) continue;
    const sc = p.data;
    if (sc.type === 'quiz' && sc.answer >= sc.options.length) continue;
    if (sc.type === 'sort' && sc.items.some(i => i.bucket >= sc.buckets.length)) continue;
    if (sc.type === 'formula') {
      const c = tryCompile(sc.expression, sc.degrees);
      if (!c) continue;
      const names = new Set(sc.variables.map(v => v.symbol));
      if (c.vars.some(v => !names.has(v))) continue;
      sc.variables = sc.variables.map(v => {
        const min = Math.min(v.min, v.max), max = Math.max(v.min, v.max);
        return { ...v, min, max, value: Math.min(max, Math.max(min, v.value)), step: v.step > 0 && v.step <= max - min ? v.step : (max - min) / 50 || 1 };
      });
    }
    scenes.push(sc);
    if (scenes.length >= 10) break;
  }
  return { title: typeof obj.title === 'string' ? obj.title.slice(0, 120) : 'Visual lesson', scenes };
}

/** JSON schema for Ollama structured output (flat so small models can follow it). */
export const VISUAL_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    scenes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['intro', 'concept_map', 'steps', 'cycle', 'compare', 'sort', 'hotspot', 'formula', 'timeline', 'flashcards', 'order', 'quiz'] },
          title: { type: 'string' }, narration: { type: 'string' },
        },
        required: ['type', 'title', 'narration'],
      },
    },
  },
  required: ['title', 'scenes'],
} as const;

export const SCENE_GUIDE = `Scene types (use the exact field names):
- intro: {emoji, bullets[≤3]} — hook with a big picture.
- concept_map: {center:{label,emoji}, nodes:[{label,emoji,detail}] 3–6} — key ideas around the main idea.
- steps: {steps:[{label,emoji,detail}] 3–7} — a process in order (how something happens / method to solve).
- cycle: {stages:[{label,emoji,detail}] 3–6} — a repeating cycle (water cycle, life cycle, carbon cycle).
- compare: {columns:[{heading,emoji,points[]}] 2–3} — differences between things.
- sort: {buckets:[2–3 names], items:[{label,emoji,bucket:index}] 4–8} — student sorts items into groups.
- hotspot: {emoji, label, parts:[{label,detail}] 3–6} — a labelled picture; student taps each part.
- formula: {expression, display, result:{symbol,label,unit}, variables:[{symbol,label,unit,min,max,step,value}] 1–4, degrees} — student moves sliders and sees the result change. "expression" uses only the variable symbols, numbers, + - * / ^ ( ) and sin cos tan sqrt abs ln log exp pi (angles in degrees). Example: "u*sin(theta)/g".
- timeline: {events:[{when,title,detail,emoji}] 3–7} — dated events (history, discoveries).
- flashcards: {cards:[{front,back,emoji}] 3–6} — key terms to flip.
- order: {items:[3–6 strings in the CORRECT order]} — student puts steps in order.
- quiz: {q, options[4], answer (0-based index), explanation} — a quick check.`;
