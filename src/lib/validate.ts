import { z } from 'zod';

export const ctxSchema = z.object({
  kind: z.enum(['board', 'exam']),
  board: z.string().max(40).optional(),
  cls: z.number().int().min(1).max(13).nullable().optional(),
  subject: z.string().max(160).optional(),
  unit: z.string().max(300).optional(),
  topics: z.array(z.string().max(400)).max(40).optional(),
  exam: z.string().max(120).optional(),
  examId: z.string().max(40).optional(),
  units: z.array(z.string().max(300)).max(60).optional(),
  mastery: z.number().min(0).max(1).optional(),
  weakTopics: z.array(z.string().max(200)).max(10).optional(),
  language: z.enum(['en', 'hi', 'pa']).optional(),
});

export const chatBody = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(40),
  ctx: ctxSchema.nullable().optional(),
  mode: z.enum(['socratic', 'explain', 'check']).default('socratic'),
});

export const lessonBody = z.object({ ctx: ctxSchema });

export const questionsBody = z.object({
  ctx: ctxSchema,
  n: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  purpose: z.enum(['practice', 'test', 'diagnostic', 'mock']).default('practice'),
  avoid: z.array(z.string().max(300)).max(40).optional(),
});

export const questionOut = z.object({
  q: z.string().min(3),
  options: z.array(z.string()).min(2).max(6),
  answer: z.coerce.number().int().min(0),
  explanation: z.string().default(''),
  hint: z.string().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).catch('medium'),
  topic: z.string().default(''),
  whyWrong: z.array(z.string()).optional(),
}).refine(q => q.answer < q.options.length, 'answer out of range');
