/**
 * Core type contracts for the agent orchestration runtime.
 */
export type AgentRunStatus = "queued" | "running" | "completed" | "failed";

export type AgentStageStatus = "pending" | "running" | "completed" | "failed";

/**
 * Stable stage identifiers used by the orchestrator state machine.
 */
export type AgentStageId =
  | "normalize_idea"
  | "generate_spec"
  | "generate_plan"
  | "build_app"
  | "run_qa"
  | "record_demo";

export interface AgentStage {
  id: AgentStageId;
  label: string;
  status: AgentStageStatus;
  detail?: string;
  error?: string;
  startedAt?: string;
  endedAt?: string;
}

/**
 * Structured outputs produced by stage agents and exposed via APIs.
 */
export interface AgentRunOutputs {
  normalizedIdea?: string;
  specMarkdown?: string;
  planMarkdown?: string;
  buildSummary?: string;
  qaSummary?: string;
  demoScript?: string;
}

export interface AgentRunArtifacts {
  previewUrl?: string;
  repoUri?: string;
  demoVideoUri?: string;
  qaReportUri?: string;
}

/**
 * Canonical run document tracked by the runtime store.
 */
export interface AgentRun {
  id: string;
  workspaceId: string;
  ideaText: string;
  status: AgentRunStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  stages: AgentStage[];
  logs: string[];
  outputs: AgentRunOutputs;
  artifacts: AgentRunArtifacts;
}

/**
 * Snapshot passed into each stage execution.
 */
export interface AgentExecutionContext {
  run: AgentRun;
  outputs: AgentRunOutputs;
  artifacts: AgentRunArtifacts;
  log: (message: string) => void;
}

/**
 * Partial updates produced by a stage and merged by the orchestrator.
 */
export interface AgentExecutionResult {
  detail: string;
  outputs?: Partial<AgentRunOutputs>;
  artifacts?: Partial<AgentRunArtifacts>;
}

export interface AgentDefinition {
  id: AgentStageId;
  label: string;
  execute: (context: AgentExecutionContext) => Promise<AgentExecutionResult>;
}
