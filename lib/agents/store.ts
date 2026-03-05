import type { AgentRun } from "@/lib/agents/types";

type AgentRunStore = {
  runs: Map<string, AgentRun>;
};

type GlobalAgentStore = {
  __zonnovaAgentRuns?: AgentRunStore;
};

const globalAgentStore = globalThis as typeof globalThis & GlobalAgentStore;

const store: AgentRunStore = globalAgentStore.__zonnovaAgentRuns ?? {
  runs: new Map<string, AgentRun>(),
};

if (!globalAgentStore.__zonnovaAgentRuns) {
  globalAgentStore.__zonnovaAgentRuns = store;
}

function cloneRun(run: AgentRun): AgentRun {
  return structuredClone(run);
}

export function insertAgentRun(run: AgentRun): AgentRun {
  store.runs.set(run.id, run);
  return cloneRun(run);
}

export function getAgentRun(runId: string): AgentRun | undefined {
  const run = store.runs.get(runId);
  return run ? cloneRun(run) : undefined;
}

export function listAgentRuns(workspaceId?: string): AgentRun[] {
  const runs = Array.from(store.runs.values())
    .filter((run) => (workspaceId ? run.workspaceId === workspaceId : true))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return runs.map((run) => cloneRun(run));
}

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
