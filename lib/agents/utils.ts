export function nowIso(): string {
  return new Date().toISOString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function makeAgentRunId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `run-agent-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `run-agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function timestampedLog(source: string, message: string): string {
  return `${nowIso()} ${source}: ${message}`;
}

export function compactSentence(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
