/**
 * Orchestrates sequential execution of agent stages for each run.
 */
import { AGENT_PIPELINE } from "@/lib/agents/worker-agents";
import { getAgentRun, insertAgentRun, listAgentRuns, updateAgentRun } from "@/lib/agents/store";
import type { AgentRun, AgentStage } from "@/lib/agents/types";
import { makeAgentRunId, nowIso, timestampedLog } from "@/lib/agents/utils";

/**
 * Builds the initial pending stage list from the static pipeline definition.
 */
function buildInitialStages(): AgentStage[] {
  return AGENT_PIPELINE.map((agent) => ({
    id: agent.id,
    label: agent.label,
    status: "pending",
  }));
}

/**
 * Appends a timestamped log entry to a run.
 */
function appendRunLog(runId: string, source: string, message: string) {
  updateAgentRun(runId, (run) => {
    run.logs.push(timestampedLog(source, message));
  });
}

/**
 * Executes the full agent pipeline sequentially for a given run.
 */
async function executeRun(runId: string): Promise<void> {
  const startingRun = updateAgentRun(runId, (run) => {
    run.status = "running";
    run.startedAt = nowIso();
    run.logs.push(timestampedLog("orchestrator", "Run moved to running state."));
  });

  if (!startingRun) {
    return;
  }

  /**
   * Sequential execution keeps state transitions deterministic and easier to inspect.
   */
  for (const agent of AGENT_PIPELINE) {
    updateAgentRun(runId, (run) => {
      const stage = run.stages.find((item) => item.id === agent.id);
      if (!stage) {
        return;
      }

      stage.status = "running";
      stage.startedAt = nowIso();
      stage.error = undefined;
      stage.detail = undefined;
    });

    try {
      const runSnapshot = getAgentRun(runId);
      if (!runSnapshot) {
        return;
      }

      const result = await agent.execute({
        run: runSnapshot,
        outputs: runSnapshot.outputs,
        artifacts: runSnapshot.artifacts,
        log: (message) => appendRunLog(runId, agent.id, message),
      });

      updateAgentRun(runId, (run) => {
        const stage = run.stages.find((item) => item.id === agent.id);
        if (!stage) {
          return;
        }

        stage.status = "completed";
        stage.endedAt = nowIso();
        stage.detail = result.detail;

        if (result.outputs) {
          run.outputs = {
            ...run.outputs,
            ...result.outputs,
          };
        }

        if (result.artifacts) {
          run.artifacts = {
            ...run.artifacts,
            ...result.artifacts,
          };
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown agent failure";

      updateAgentRun(runId, (run) => {
        const stage = run.stages.find((item) => item.id === agent.id);
        if (stage) {
          stage.status = "failed";
          stage.endedAt = nowIso();
          stage.error = message;
        }

        run.status = "failed";
        run.endedAt = nowIso();
        run.logs.push(timestampedLog("orchestrator", `${agent.id} failed: ${message}`));
      });

      return;
    }
  }

  updateAgentRun(runId, (run) => {
    run.status = "completed";
    run.endedAt = nowIso();
    run.logs.push(timestampedLog("orchestrator", "Run completed successfully."));
  });
}

/**
 * Creates and enqueues a new agent run.
 */
export function enqueueAgentRun(workspaceId: string, ideaText: string): AgentRun {
  const run: AgentRun = {
    id: makeAgentRunId(),
    workspaceId,
    ideaText,
    status: "queued",
    createdAt: nowIso(),
    stages: buildInitialStages(),
    logs: [timestampedLog("orchestrator", "Run queued.")],
    outputs: {},
    artifacts: {},
  };

  const persistedRun = insertAgentRun(run);

  /**
   * Fire-and-forget orchestration so API handlers can return immediately.
   */
  queueMicrotask(() => {
    void executeRun(run.id);
  });

  return persistedRun;
}

/**
 * Returns a run by ID.
 */
export function getAgentRunById(runId: string): AgentRun | undefined {
  return getAgentRun(runId);
}

/**
 * Lists all runs or only runs for a specific workspace.
 */
export function listWorkspaceAgentRuns(workspaceId?: string): AgentRun[] {
  return listAgentRuns(workspaceId);
}
