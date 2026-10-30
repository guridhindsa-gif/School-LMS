import 'server-only';
import { OllamaError, parseLooseJSON, type ChatMessage } from './ollama';

/**
 * Claude (Anthropic Messages API) client, server side only.
 *
 * Used when a user adds their own Claude API key in Settings & AI (sent per request in the
 * `x-claude-key` header, never stored or logged on the server), or when the school sets
 * ANTHROPIC_API_KEY with AI_PROVIDER=claude.
 * Note: a claude.ai Pro/Max subscription does not include API access; keys come from the
 * Claude Console and API usage is billed there.
 */
const API = 'https://api.anthropic.com/v1';
const VERSION = '2023-06-01';

export const CLAUDE_MODELS = ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'] as const;
export type ClaudeModel = (typeof CLAUDE_MODELS)[number];
export const DEFAULT_CLAUDE_MODEL: ClaudeModel = 'claude-sonnet-5-5';

export interface ClaudeTarget { key: string; model: string }

/** Basic shape check so obviously wrong input never leaves the server. */
export const looksLikeClaudeKey = (k: string) => /^sk-ant-[A-Za-z0-9_\-]{20,300}$/.test(k);

function headers(key: string) {
  return { 'x-api-key': key, 'anthropic-version': VERSION, 'content-type': 'application/json' };
}

/** Claude takes the system prompt separately and needs turns that start with the user and alternate. */
export function toClaude(messages: ChatMessage[]) {
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const turns: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of messages) {
    if (m.role === 'system' || !m.content.trim()) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content;
    else turns.push({ role: m.role, content: m.content });
  }
  while (turns.length && turns[0].role !== 'user') turns.shift();
  return { system, messages: turns };
}

async function post(t: ClaudeTarget, body: Record<string, unknown>, signal?: AbortSignal) {
  let res: Response;
  try {
    res = await fetch(`${API}/messages`, { method: 'POST', headers: headers(t.key), body: JSON.stringify({ model: t.model, ...body }), signal, cache: 'no-store' });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new OllamaError('Cannot reach the Claude API.', 503, 'unreachable');
  }
  if (!res.ok) throw await claudeError(res);
  return res;
}

async function claudeError(res: Response) {
  let type = '', message = '';
  try { const j = await res.json(); type = j?.error?.type || ''; message = j?.error?.message || ''; } catch { /* ignore */ }
  if (res.status === 401 || type === 'authentication_error') return new OllamaError('Claude rejected the API key.', 401, 'claude_key');
  if (res.status === 403 || type === 'permission_error') return new OllamaError('This Claude API key is not allowed to use that model.', 403, 'claude_key');
  if (res.status === 404 || type === 'not_found_error') return new OllamaError('That Claude model is not available for this key.', 404, 'model_not_found');
  if (res.status === 429 || type === 'rate_limit_error') return new OllamaError('Claude rate limit reached. Wait a minute and try again.', 429, 'rate_limited');
  if (res.status === 402 || /credit|billing/i.test(message)) return new OllamaError('The Claude account has no API credit left.', 402, 'claude_billing');
  if (res.status === 529 || type === 'overloaded_error') return new OllamaError('Claude is busy right now. Try again shortly.', 503, 'busy');
  return new OllamaError(`Claude error ${res.status}`, 502, 'claude_error');
}

/** Streams the reply as plain text (SSE `content_block_delta` → `text_delta`). */
export async function claudeStream(t: ClaudeTarget, messages: ChatMessage[], opts: { temperature?: number; signal?: AbortSignal; maxTokens?: number } = {}) {
  const { system, messages: turns } = toClaude(messages);
  const res = await post(t, { system: system || undefined, messages: turns, max_tokens: opts.maxTokens ?? 8000, temperature: opts.temperature ?? 0.4, stream: true }, opts.signal);
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = '';
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) { controller.close(); return; }
          buf += dec.decode(value, { stream: true });
          const events = buf.split('\n\n');
          buf = events.pop() || '';
          let sent = 0;
          for (const ev of events) {
            const data = ev.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join('');
            if (!data) continue;
            try {
              const j = JSON.parse(data);
              if (j.type === 'content_block_delta' && j.delta?.type === 'text_delta' && j.delta.text) { controller.enqueue(enc.encode(j.delta.text)); sent++; }
              else if (j.type === 'error') { controller.enqueue(enc.encode(`\n\n[AI error: ${j.error?.type || 'error'}]`)); sent++; }
            } catch { /* ignore malformed event */ }
          }
          if (sent) return;
        }
      } catch (e) { controller.error(e); }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
}

/** One reply that must be JSON (the prompts already ask for JSON only; parsed leniently). */
export async function claudeJSON<T = unknown>(t: ClaudeTarget, messages: ChatMessage[], opts: { temperature?: number; signal?: AbortSignal; maxTokens?: number } = {}): Promise<T> {
  const { system, messages: turns } = toClaude(messages);
  const res = await post(t, {
    system: [system, 'Reply with valid JSON only: no prose, no Markdown fences.'].filter(Boolean).join('\n\n'),
    messages: turns, max_tokens: opts.maxTokens ?? 8000, temperature: opts.temperature ?? 0.3,
  }, opts.signal);
  const j = await res.json();
  const text = (j?.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
  return parseLooseJSON<T>(text);
}

/** Checks the key by listing models (no tokens spent). Never returns the key. */
export async function claudeHealth(t: ClaudeTarget) {
  try {
    const res = await fetch(`${API}/models?limit=50`, { headers: headers(t.key), cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!res.ok) { const e = await claudeError(res); return { ok: false, provider: 'claude' as const, model: t.model, error: e.message, code: e.code }; }
    const j = await res.json().catch(() => ({}));
    const models: string[] = (j.data || []).map((m: { id: string }) => m.id);
    return { ok: true, provider: 'claude' as const, model: t.model, models: models.slice(0, 30), modelAvailable: !models.length || models.includes(t.model) };
  } catch {
    return { ok: false, provider: 'claude' as const, model: t.model, error: 'Cannot reach the Claude API.', code: 'unreachable' };
  }
}
