/**
 * Shared utility helpers for the agent runtime.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Adds deterministic async delay to simulated stage workers.
 *
 * @param ms Milliseconds to wait.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Generates readable run IDs for local orchestration and debugging.
 */
export function makeAgentRunId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `run-agent-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `run-agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function timestampedLog(source: string, message: string): string {
  return `${nowIso()} ${source}: ${message}`;
}

/**
 * Normalizes free-form note text before it is used by prompt builders.
 */
export function compactSentence(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
