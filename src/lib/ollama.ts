import 'server-only';

/**
 * Ollama client (server side only — the API key never reaches the browser).
 *
 * Works with:
 *  - Ollama Cloud: set OLLAMA_API_KEY (host defaults to https://ollama.com)
 *  - Local Ollama: set OLLAMA_HOST=http://127.0.0.1:11434 (no key)
 *  - Any Ollama-compatible server (including scripts/mock-ollama.mjs for demos)
 */
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export function ollamaConfig() {
  const key = process.env.OLLAMA_API_KEY?.trim() || '';
  const host = (process.env.OLLAMA_HOST?.trim() || (key ? 'https://ollama.com' : 'http://127.0.0.1:11434')).replace(/\/+$/, '');
  const model = process.env.OLLAMA_MODEL?.trim() || (key ? 'gpt-oss:20b' : 'llama3.1:8b');
  const fastModel = process.env.OLLAMA_FAST_MODEL?.trim() || model;
  return { host, key, model, fastModel, cloud: host.includes('ollama.com') };
}

function headers() {
  const { key } = ollamaConfig();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

export class OllamaError extends Error {
  constructor(message: string, public status = 502, public code = 'ollama_error') { super(message); }
}

async function post(path: string, body: unknown, signal?: AbortSignal) {
  const { host } = ollamaConfig();
  let res: Response;
  try {
    res = await fetch(`${host}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body), signal, cache: 'no-store' });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new OllamaError(`Cannot reach Ollama at ${host}. Start Ollama or set OLLAMA_HOST / OLLAMA_API_KEY in .env.local.`, 503, 'unreachable');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) throw new OllamaError('Ollama rejected the API key. Check OLLAMA_API_KEY in .env.local.', 401, 'unauthorized');
    if (res.status === 404) throw new OllamaError(`Model not found on Ollama. Pull it (ollama pull <model>) or change OLLAMA_MODEL. ${text.slice(0, 200)}`, 404, 'model_not_found');
    throw new OllamaError(`Ollama error ${res.status}: ${text.slice(0, 300)}`, 502);
  }
  return res;
}

/**
 * Streams a chat completion as plain text chunks.
 * Ollama replies with NDJSON lines: {"message":{"content":"..."},"done":false}
 * Reasoning models may send `message.thinking` first — we skip it.
 */
export async function chatStream(messages: ChatMessage[], opts: { model?: string; temperature?: number; signal?: AbortSignal } = {}) {
  const { model } = ollamaConfig();
  const res = await post('/api/chat', {
    model: opts.model || model,
    messages,
    stream: true,
    options: { temperature: opts.temperature ?? 0.4 },
  }, opts.signal);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = '';
  return new ReadableStream<Uint8Array>({
    // Keep reading until at least one chunk is enqueued: a pull that enqueues nothing
    // (e.g. a network chunk that ends mid-line) would otherwise stall the stream.
    async pull(controller) {
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) {
            if (buf.trim()) emit(buf, controller);
            controller.close();
            return;
          }
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          let sent = 0;
          for (const line of lines) sent += emit(line, controller);
          if (sent) return;
        }
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
  function emit(line: string, controller: ReadableStreamDefaultController<Uint8Array>): number {
    const t = line.trim();
    if (!t) return 0;
    try {
      const j = JSON.parse(t);
      if (j.error) { controller.enqueue(encoder.encode(`\n\n[AI error: ${j.error}]`)); return 1; }
      const c = j.message?.content;
      if (c) { controller.enqueue(encoder.encode(c)); return 1; }
    } catch { /* malformed line, ignore */ }
    return 0;
  }
}

/** Non-streaming completion that must return JSON matching `schema` (Ollama structured outputs). */
export async function chatJSON<T = unknown>(messages: ChatMessage[], schema: object, opts: { model?: string; temperature?: number; signal?: AbortSignal } = {}): Promise<T> {
  const { model } = ollamaConfig();
  const res = await post('/api/chat', {
    model: opts.model || model,
    messages,
    stream: false,
    format: schema,
    options: { temperature: opts.temperature ?? 0.3 },
  }, opts.signal);
  const j = await res.json();
  const content: string = j?.message?.content ?? '';
  return parseLooseJSON<T>(content);
}

export function parseLooseJSON<T>(text: string): T {
  const t = text.trim();
  try { return JSON.parse(t); } catch { /* fall through */ }
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch { /* fall through */ } }
  const start = t.search(/[[{]/);
  const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if (start >= 0 && end > start) return JSON.parse(t.slice(start, end + 1));
  throw new OllamaError('The model did not return valid JSON. Try again or use a larger model.', 502, 'invalid_json');
}

export async function health() {
  const cfg = ollamaConfig();
  try {
    const res = await fetch(`${cfg.host}/api/tags`, { headers: headers(), cache: 'no-store', signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { ok: false, host: cfg.host, model: cfg.model, cloud: cfg.cloud, hasKey: !!cfg.key, error: `HTTP ${res.status}` };
    const j = await res.json().catch(() => ({}));
    const models: string[] = (j.models || []).map((m: { name?: string; model?: string }) => m.name || m.model).filter(Boolean);
    const modelAvailable = !models.length || models.some(m => m === cfg.model || m.split(':')[0] === cfg.model.split(':')[0]);
    return { ok: true, host: cfg.host, model: cfg.model, cloud: cfg.cloud, hasKey: !!cfg.key, models: models.slice(0, 30), modelAvailable };
  } catch {
    return { ok: false, host: cfg.host, model: cfg.model, cloud: cfg.cloud, hasKey: !!cfg.key, error: 'unreachable' };
  }
}
