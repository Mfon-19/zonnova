/**
 * In-memory storage primitives for agent run state.
 */
import type { AgentRun } from "@/lib/agents/types";

type AgentRunStore = {
  runs: Map<string, AgentRun>;
};

type GlobalAgentStore = {
  __zonnovaAgentRuns?: AgentRunStore;
};

/**
 * In-memory run store with hot-reload persistence during local development.
 */
const globalAgentStore = globalThis as typeof globalThis & GlobalAgentStore;

const store: AgentRunStore = globalAgentStore.__zonnovaAgentRuns ?? {
  runs: new Map<string, AgentRun>(),
};

if (!globalAgentStore.__zonnovaAgentRuns) {
  globalAgentStore.__zonnovaAgentRuns = store;
}

/**
 * Returns a deep clone to protect canonical store state from external mutation.
 */
function cloneRun(run: AgentRun): AgentRun {
  return structuredClone(run);
}

/**
 * Inserts a new run into the store.
 */
export function insertAgentRun(run: AgentRun): AgentRun {
  store.runs.set(run.id, run);
  return cloneRun(run);
}

/**
 * Fetches a run by ID.
 */
export function getAgentRun(runId: string): AgentRun | undefined {
  const run = store.runs.get(runId);
  return run ? cloneRun(run) : undefined;
}

/**
 * Lists runs, optionally filtered by workspace ID, newest first.
 */
export function listAgentRuns(workspaceId?: string): AgentRun[] {
  const runs = Array.from(store.runs.values())
    .filter((run) => (workspaceId ? run.workspaceId === workspaceId : true))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return runs.map((run) => cloneRun(run));
}

/**
 * Mutates a stored run with an updater callback and returns a cloned snapshot.
 */
export function updateAgentRun(
  runId: string,
  updater: (run: AgentRun) => void,
): AgentRun | undefined {
  const run = store.runs.get(runId);
  if (!run) {
    return undefined;
  }

  updater(run);
  store.runs.set(runId, run);

  return cloneRun(run);
}
