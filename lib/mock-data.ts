/**
 * Live workspace domain models derived from agent-run state.
 */
import { getAgentRunById, listWorkspaceAgentRuns } from "@/lib/agents/orchestrator";
import type {
  AgentRun,
  AgentRunStatus,
  AgentStageStatus,
} from "@/lib/agents/types";

export type IdeaStatus =
  | "queued"
  | "planning"
  | "building"
  | "ready"
  | "failed"
  | "discarded";

export type RunStatus = "queued" | "running" | "completed" | "failed";

export type RunStepStatus = "pending" | "running" | "completed" | "failed";

export type ArtifactType = "preview" | "repo" | "video" | "qa";

/**
 * Represents a product idea tracked in the workspace.
 */
export interface Idea {
  id: string;
  title: string;
  summary: string;
  status: IdeaStatus;
  updatedAt: string;
  tags: string[];
  assumptions: string[];
  mvpScope: string[];
  lastRunId?: string;
}

/**
 * A single step in an autonomous run pipeline.
 */
export interface RunStep {
  id: string;
  label: string;
  status: RunStepStatus;
  detail: string;
  durationSec?: number;
}

/**
 * Run metadata, usage stats, and execution timeline.
 */
export interface Run {
  id: string;
  ideaId: string;
  status: RunStatus;
  startedAt: string;
  endedAt?: string;
  modelMix: string;
  budgetUsd: number;
  tokensIn: number;
  tokensOut: number;
  steps: RunStep[];
  logs: string[];
}

/**
 * File or link output generated during/after a run.
 */
export interface Artifact {
  id: string;
  runId: string;
  type: ArtifactType;
  label: string;
  uri: string;
  size: string;
}

/**
 * Hashes free-form text into a stable unsigned integer.
 */
function hashSeed(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

/**
 * Generates a stable idea ID from raw idea text.
 */
function ideaIdFromText(text: string): string {
  return `idea-${hashSeed(text).toString(16)}`;
}

/**
 * Converts agent-run status to UI idea status.
 */
function mapRunStatusToIdeaStatus(status: AgentRunStatus): IdeaStatus {
  if (status === "queued") {
    return "queued";
  }

  if (status === "running") {
    return "building";
  }

  if (status === "completed") {
    return "ready";
  }

  return "failed";
}

/**
 * Converts agent stage status to run-step status.
 */
function mapStageStatusToRunStepStatus(status: AgentStageStatus): RunStepStatus {
  return status;
}

/**
 * Formats ISO timestamps into compact relative labels.
 */
function relativeTime(isoTime: string): string {
  const value = Date.parse(isoTime);
  if (Number.isNaN(value)) {
    return "just now";
  }

  const deltaMs = Math.max(Date.now() - value, 0);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (deltaMs < minute) {
    return "just now";
  }

  if (deltaMs < hour) {
    return `${Math.floor(deltaMs / minute)}m ago`;
  }

  if (deltaMs < day) {
    return `${Math.floor(deltaMs / hour)}h ago`;
  }

  return `${Math.floor(deltaMs / day)}d ago`;
}

/**
 * Converts free-form text to a single readable line.
 */
function compactLine(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Derives a short title from idea text.
 */
function titleFromIdeaText(ideaText: string): string {
  const firstLine = compactLine(ideaText.split("\n")[0] ?? "");
  if (!firstLine) {
    return "Untitled idea";
  }

  if (firstLine.length <= 80) {
    return firstLine;
  }

  return `${firstLine.slice(0, 77)}...`;
}

/**
 * Parses bullet points from a named markdown section.
 */
function parseSectionBullets(markdown: string | undefined, sectionTitle: string): string[] {
  if (!markdown) {
    return [];
  }

  const lines = markdown.split("\n");
  const normalizedTarget = sectionTitle.trim().toLowerCase();
  let inSection = false;
  const bullets: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+(.+)$/);

    if (heading) {
      const normalizedHeading = heading[1].trim().toLowerCase();
      inSection = normalizedHeading === normalizedTarget;
      continue;
    }

    if (!inSection) {
      continue;
    }

    if (line.startsWith("#")) {
      break;
    }

    if (line.startsWith("- ")) {
      bullets.push(line.slice(2).trim());
    }
  }

  return bullets.filter((item) => item.length > 0);
}

/**
 * Computes stage duration in seconds when start/end timestamps are available.
 */
function durationSeconds(startedAt?: string, endedAt?: string): number | undefined {
  if (!startedAt || !endedAt) {
    return undefined;
  }

  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(endedAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return undefined;
  }

  return Math.floor((endMs - startMs) / 1000);
}

/**
 * Converts an AgentRun to workspace Run shape.
 */
function toRun(run: AgentRun): Run {
  return {
    id: run.id,
    ideaId: ideaIdFromText(run.ideaText),
    status: run.status,
    startedAt: run.startedAt ?? run.createdAt,
    endedAt: run.endedAt,
    modelMix: "Nova Pro + Nova Lite",
    budgetUsd: 0,
    tokensIn: 0,
    tokensOut: 0,
    steps: run.stages.map((stage) => ({
      id: stage.id,
      label: stage.label,
      status: mapStageStatusToRunStepStatus(stage.status),
      detail: stage.detail ?? stage.error ?? "Pending execution.",
      durationSec: durationSeconds(stage.startedAt, stage.endedAt),
    })),
    logs: run.logs,
  };
}

/**
 * Converts an AgentRun to workspace Artifact list.
 */
function toArtifacts(run: AgentRun): Artifact[] {
  const artifacts: Artifact[] = [];

  if (run.artifacts.previewUrl) {
    artifacts.push({
      id: `${run.id}-preview`,
      runId: run.id,
      type: "preview",
      label: "Live preview",
      uri: run.artifacts.previewUrl,
      size: "link",
    });
  }

  if (run.artifacts.repoUri) {
    artifacts.push({
      id: `${run.id}-repo`,
      runId: run.id,
      type: "repo",
      label: "Repository snapshot",
      uri: run.artifacts.repoUri,
      size: "link",
    });
  }

  if (run.artifacts.demoVideoUri) {
    artifacts.push({
      id: `${run.id}-video`,
      runId: run.id,
      type: "video",
      label: "Demo recording",
      uri: run.artifacts.demoVideoUri,
      size: "link",
    });
  }

  if (run.artifacts.qaReportUri) {
    artifacts.push({
      id: `${run.id}-qa`,
      runId: run.id,
      type: "qa",
      label: "QA report",
      uri: run.artifacts.qaReportUri,
      size: "link",
    });
  }

  return artifacts;
}

/**
 * Builds current ideas from all available agent runs.
 */
function buildIdeasFromRuns(runs: AgentRun[]): Idea[] {
  const grouped = new Map<string, AgentRun[]>();

  for (const run of runs) {
    const ideaId = ideaIdFromText(run.ideaText);
    const collection = grouped.get(ideaId) ?? [];
    collection.push(run);
    grouped.set(ideaId, collection);
  }

  return Array.from(grouped.entries()).map(([ideaId, ideaRuns]) => {
    const ordered = [...ideaRuns].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
    const latestRun = ordered[0];

    const scope = parseSectionBullets(
      latestRun.outputs.specMarkdown,
      "Must-Have Requirements",
    );
    const assumptions = parseSectionBullets(latestRun.outputs.specMarkdown, "Non-Goals");
    const summarySource =
      latestRun.outputs.normalizedIdea ?? compactLine(latestRun.ideaText);

    return {
      id: ideaId,
      title: titleFromIdeaText(latestRun.ideaText),
      summary: summarySource,
      status: mapRunStatusToIdeaStatus(latestRun.status),
      updatedAt: relativeTime(latestRun.createdAt),
      tags: ["agent-run", latestRun.status],
      assumptions:
        assumptions.length > 0
          ? assumptions
          : ["No explicit assumptions captured yet."],
      mvpScope:
        scope.length > 0 ? scope : ["No explicit MVP scope generated yet."],
      lastRunId: latestRun.id,
    };
  });
}

/**
 * Loads all runs currently tracked by the in-memory orchestrator.
 */
function listAllAgentRuns(): AgentRun[] {
  return listWorkspaceAgentRuns();
}

/**
 * Converts a workspace slug into a readable workspace label.
 */
export function getWorkspaceLabel(workspaceId: string): string {
  return workspaceId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Lists non-discarded ideas in the workspace.
 */
export function listActiveIdeas(): Idea[] {
  return buildIdeasFromRuns(listAllAgentRuns());
}

/**
 * Lists discarded ideas.
 */
export function listDiscardedIdeas(): Idea[] {
  return [];
}

/**
 * Returns an idea by ID.
 */
export function getIdeaById(ideaId: string): Idea | undefined {
  return listActiveIdeas().find((idea) => idea.id === ideaId);
}

/**
 * Lists runs for an idea.
 */
export function listRunsForIdea(ideaId: string): Run[] {
  return listAllAgentRuns()
    .filter((run) => ideaIdFromText(run.ideaText) === ideaId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((run) => toRun(run));
}

/**
 * Returns a run by ID.
 */
export function getRunById(runId: string): Run | undefined {
  const run = getAgentRunById(runId);
  return run ? toRun(run) : undefined;
}

/**
 * Lists artifacts for a run.
 */
export function listArtifactsForRun(runId: string): Artifact[] {
  const run = getAgentRunById(runId);
  return run ? toArtifacts(run) : [];
}

/**
 * Aggregates active idea counts by status.
 */
export function ideaStatusCounts() {
  return listActiveIdeas().reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}
