import 'server-only';
import { chatJSON as ollamaJSON, chatStream as ollamaStream, health as ollamaHealth, ollamaConfig, OllamaError, type ChatMessage } from './ollama';
import { CLAUDE_MODELS, DEFAULT_CLAUDE_MODEL, claudeHealth, claudeJSON, claudeStream, looksLikeClaudeKey, type ClaudeTarget } from './claude';

/**
 * Picks the AI provider for one request:
 *  1. the user's own Claude API key (header `x-claude-key`, from Settings & AI on their device);
 *  2. the school's Claude key (ANTHROPIC_API_KEY with AI_PROVIDER=claude);
 *  3. otherwise the school's Ollama (default).
 * The key is used for this request only: never stored, logged or returned.
 */
export type AiTarget = { kind: 'ollama' } | ({ kind: 'claude'; own: boolean } & ClaudeTarget);

const pickModel = (m?: string | null) => (m && (CLAUDE_MODELS as readonly string[]).includes(m) ? m : process.env.CLAUDE_MODEL?.trim() || DEFAULT_CLAUDE_MODEL);

export function aiFor(req: Request): AiTarget {
  const own = req.headers.get('x-claude-key')?.trim();
  if (own) {
    if (!looksLikeClaudeKey(own)) throw new OllamaError('That does not look like a Claude API key.', 400, 'claude_key');
    return { kind: 'claude', own: true, key: own, model: pickModel(req.headers.get('x-claude-model')) };
  }
  const school = process.env.ANTHROPIC_API_KEY?.trim();
  if (school && (process.env.AI_PROVIDER || '').toLowerCase() === 'claude') return { kind: 'claude', own: false, key: school, model: pickModel(null) };
  return { kind: 'ollama' };
}

type Opts = { temperature?: number; signal?: AbortSignal; model?: string };

export function chatStream(ai: AiTarget, messages: ChatMessage[], opts: Opts = {}) {
  return ai.kind === 'claude' ? claudeStream(ai, messages, opts) : ollamaStream(messages, opts);
}

export function chatJSON<T = unknown>(ai: AiTarget, messages: ChatMessage[], schema: object, opts: Opts = {}): Promise<T> {
  return ai.kind === 'claude' ? claudeJSON<T>(ai, messages, opts) : ollamaJSON<T>(messages, schema, opts);
}

export async function health(ai: AiTarget) {
  if (ai.kind === 'claude') return { ...(await claudeHealth(ai)), own: ai.own, host: 'api.anthropic.com', cloud: true, hasKey: true };
  return { ...(await ollamaHealth()), provider: 'ollama' as const, own: false };
}

export { ollamaConfig };
