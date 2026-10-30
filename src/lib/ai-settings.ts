'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * "Use my own Claude": a user's Claude API key, kept on this device only (localStorage).
 * It is sent with each AI request to this app's own server (header `x-claude-key`), which
 * calls Claude for that request and never stores or logs it.
 */
export const CLAUDE_MODEL_OPTIONS = ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'] as const;

interface AiSettings {
  useClaude: boolean;
  claudeKey: string;
  claudeModel: string;
  setClaude: (p: Partial<Pick<AiSettings, 'useClaude' | 'claudeKey' | 'claudeModel'>>) => void;
  forgetKey: () => void;
}

export const useAiSettings = create<AiSettings>()(
  persist(
    set => ({
      useClaude: false,
      claudeKey: '',
      claudeModel: CLAUDE_MODEL_OPTIONS[0],
      setClaude: p => set(p),
      forgetKey: () => set({ useClaude: false, claudeKey: '' }),
    }),
    { name: 'school-lms-ai', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

/** Headers that route this request to the user's own Claude, when they turned it on. */
export function aiHeaders(): Record<string, string> {
  try {
    const s = useAiSettings.getState();
    if (s.useClaude && s.claudeKey) return { 'x-claude-key': s.claudeKey, 'x-claude-model': s.claudeModel };
  } catch { /* store unavailable (server render) */ }
  return {};
}

export const maskKey = (k: string) => (k.length > 14 ? `${k.slice(0, 10)}…${k.slice(-4)}` : '••••');
