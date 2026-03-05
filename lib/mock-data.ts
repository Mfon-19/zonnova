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

export interface RunStep {
  id: string;
  label: string;
  status: RunStepStatus;
  detail: string;
  durationSec?: number;
}

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

export interface Artifact {
  id: string;
  runId: string;
  type: ArtifactType;
  label: string;
  uri: string;
  size: string;
}

const ideas: Idea[] = [
  {
    id: "idea-contextmesh-notebook",
    title: "ContextMesh Notebook",
    summary:
      "Capture rough ideas, auto-generate spec + build + browser demo without human checkpoints.",
    status: "building",
    updatedAt: "2m ago",
    tags: ["agentic", "ui", "workflow"],
    assumptions: [
      "Anonymous workspace defaults to one active run at a time.",
      "MVP templates are limited to Next.js web apps.",
      "Browser demo is 30-60 seconds and follows a happy path.",
    ],
    mvpScope: [
      "Idea inbox + status board",
      "Autonomous spec -> plan -> build chain",
      "Artifacts hub (preview, repo zip, demo video)",
    ],
    lastRunId: "run-2041",
  },
  {
    id: "idea-voice-standup-coach",
    title: "Voice Standup Coach",
    summary:
      "Team members record a 60-second standup and get a crisp async update with blockers and next actions.",
    status: "ready",
    updatedAt: "45m ago",
    tags: ["voice", "productivity"],
    assumptions: [
      "Users can opt out of transcript storage.",
      "The generated summary follows company standup format.",
      "Demo mode uses synthetic sample recordings.",
    ],
    mvpScope: [
      "Upload recording",
      "Generate summary with risks + asks",
      "Publish clean team digest",
    ],
    lastRunId: "run-2038",
  },
  {
    id: "idea-browser-quality-gym",
    title: "Browser Quality Gym",
    summary:
      "Auto-generates small browser tasks and tests if your agent can solve them under time pressure.",
    status: "planning",
    updatedAt: "1h ago",
    tags: ["evals", "browser"],
    assumptions: [
      "Scenarios should be deterministic for scoring.",
      "Each challenge has one golden completion trace.",
      "Runs should cap at three retries.",
    ],
    mvpScope: [
      "Scenario generator",
      "Agent run + score",
      "Leaderboard by success rate",
    ],
    lastRunId: "run-2035",
  },
  {
    id: "idea-move-admin-os",
    title: "Move Admin OS",
    summary:
      "Single checklist assistant that automates moving paperwork: utilities, mail, subscriptions, and DMV tasks.",
    status: "queued",
    updatedAt: "3h ago",
    tags: ["consumer", "forms"],
    assumptions: [
      "Public APIs do not exist for every provider.",
      "Users need a manual fallback for each automation.",
      "Task templates are region-specific.",
    ],
    mvpScope: [
      "Smart checklist",
      "Document reminder timeline",
      "Progress dashboard",
    ],
    lastRunId: "run-2033",
  },
  {
    id: "idea-fitness-rpg-audio",
    title: "Fitness RPG Audio",
    summary:
      "Voice-driven workouts framed as quests with adaptive difficulty and progression loops.",
    status: "failed",
    updatedAt: "6h ago",
    tags: ["voice", "gaming"],
    assumptions: [
      "Session pacing should adjust by real-time user feedback.",
      "Quest design has to avoid repetitive voice prompts.",
      "Audio generation latency must stay below two seconds.",
    ],
    mvpScope: [
      "Quest generation",
      "Voice coaching",
      "Streak and progression screen",
    ],
    lastRunId: "run-2032",
  },
  {
    id: "idea-meeting-pulse",
    title: "Meeting Pulse",
    summary:
      "Real-time meeting quality feedback with action prompts and participation balancing.",
    status: "discarded",
    updatedAt: "1d ago",
    tags: ["work", "analytics"],
    assumptions: [
      "Participants consent to sentiment analysis.",
      "Realtime prompts should be subtle and non-disruptive.",
      "Summaries should keep only actionable feedback.",
    ],
    mvpScope: [
      "Live sentiment timeline",
      "Participation balancing tips",
      "Post-meeting scorecard",
    ],
    lastRunId: "run-2027",
  },
];

const runs: Run[] = [
  {
    id: "run-2041",
    ideaId: "idea-contextmesh-notebook",
    status: "running",
    startedAt: "2026-03-04T16:05:00Z",
    modelMix: "Nova Pro + Nova Lite",
    budgetUsd: 1.74,
    tokensIn: 19840,
    tokensOut: 6510,
    steps: [
      {
        id: "step-1",
        label: "Normalize idea",
        status: "completed",
        detail: "Extracted constraints, success metric, and edge-case assumptions.",
        durationSec: 11,
      },
      {
        id: "step-2",
        label: "Generate requirements",
        status: "completed",
        detail: "Structured PRD with MVP boundaries and failure criteria.",
        durationSec: 32,
      },
      {
        id: "step-3",
        label: "Generate implementation plan",
        status: "completed",
        detail: "Created task graph for UI, worker integration, and telemetry.",
        durationSec: 24,
      },
      {
        id: "step-4",
        label: "Build app in sandbox",
        status: "running",
        detail: "Applying component refinements and wiring run state views.",
      },
      {
        id: "step-5",
        label: "Run tests",
        status: "pending",
        detail: "Waiting for build output before smoke checks.",
      },
      {
        id: "step-6",
        label: "Record demo",
        status: "pending",
        detail: "Will capture browser flow once preview is stable.",
      },
    ],
    logs: [
      "16:05:11Z spec-agent: normalized idea note and tagged as 'agentic-webapp'.",
      "16:06:02Z plan-agent: generated 19 tasks across 4 phases.",
      "16:07:19Z build-agent: bootstrapped Next.js app and component scaffolding.",
      "16:10:41Z build-agent: wiring workspace shell and page routes.",
      "16:12:08Z build-agent: rendering artifacts dashboard widgets.",
    ],
  },
  {
    id: "run-2038",
    ideaId: "idea-voice-standup-coach",
    status: "completed",
    startedAt: "2026-03-04T14:12:00Z",
    endedAt: "2026-03-04T14:28:00Z",
    modelMix: "Nova Lite",
    budgetUsd: 0.88,
    tokensIn: 11820,
    tokensOut: 4030,
    steps: [
      {
        id: "step-1",
        label: "Normalize idea",
        status: "completed",
        detail: "Captured key workflow and target user story.",
        durationSec: 9,
      },
      {
        id: "step-2",
        label: "Generate requirements",
        status: "completed",
        detail: "Prepared concise v1 requirements and acceptance tests.",
        durationSec: 20,
      },
      {
        id: "step-3",
        label: "Build app in sandbox",
        status: "completed",
        detail: "Generated transcript upload + summary dashboard.",
        durationSec: 412,
      },
      {
        id: "step-4",
        label: "Run tests",
        status: "completed",
        detail: "Smoke and type checks passed.",
        durationSec: 38,
      },
      {
        id: "step-5",
        label: "Record demo",
        status: "completed",
        detail: "Produced 41s browser demo clip.",
        durationSec: 64,
      },
    ],
    logs: [
      "14:12:10Z spec-agent: drafted scope with one-click standup flow.",
      "14:15:22Z build-agent: generated recorder upload components.",
      "14:20:46Z qa-agent: lint and smoke checks complete.",
      "14:27:07Z demo-agent: video uploaded to artifacts storage.",
    ],
  },
  {
    id: "run-2035",
    ideaId: "idea-browser-quality-gym",
    status: "queued",
    startedAt: "2026-03-04T13:55:00Z",
    modelMix: "Nova Pro",
    budgetUsd: 0.0,
    tokensIn: 0,
    tokensOut: 0,
    steps: [
      {
        id: "step-1",
        label: "Normalize idea",
        status: "pending",
        detail: "Pending execution slot.",
      },
      {
        id: "step-2",
        label: "Generate requirements",
        status: "pending",
        detail: "Waiting for normalize stage.",
      },
    ],
    logs: ["13:55:02Z scheduler: queued behind active run for this workspace."],
  },
  {
    id: "run-2032",
    ideaId: "idea-fitness-rpg-audio",
    status: "failed",
    startedAt: "2026-03-04T09:41:00Z",
    endedAt: "2026-03-04T10:03:00Z",
    modelMix: "Nova Pro + Nova Lite",
    budgetUsd: 1.12,
    tokensIn: 15300,
    tokensOut: 5890,
    steps: [
      {
        id: "step-1",
        label: "Normalize idea",
        status: "completed",
        detail: "Idea structure extracted successfully.",
        durationSec: 12,
      },
      {
        id: "step-2",
        label: "Generate requirements",
        status: "completed",
        detail: "Requirements generated with voice constraints.",
        durationSec: 33,
      },
      {
        id: "step-3",
        label: "Build app in sandbox",
        status: "failed",
        detail: "Audio provider integration failed after retry budget.",
        durationSec: 680,
      },
      {
        id: "step-4",
        label: "Run tests",
        status: "pending",
        detail: "Skipped because build failed.",
      },
    ],
    logs: [
      "09:41:09Z spec-agent: set latency requirement <2s for voice feedback.",
      "09:52:19Z build-agent: retry #1 for audio stream endpoint.",
      "10:03:02Z build-agent: retries exhausted, run marked failed.",
    ],
  },
];

const artifacts: Artifact[] = [
  {
    id: "artifact-1",
    runId: "run-2038",
    type: "preview",
    label: "Live preview",
    uri: "https://preview.zonnova.app/run-2038",
    size: "link",
  },
  {
    id: "artifact-2",
    runId: "run-2038",
    type: "repo",
    label: "Repository snapshot",
    uri: "s3://zonnova-artifacts/run-2038/repo.zip",
    size: "12.4 MB",
  },
  {
    id: "artifact-3",
    runId: "run-2038",
    type: "video",
    label: "Demo recording",
    uri: "s3://zonnova-artifacts/run-2038/demo.webm",
    size: "19.1 MB",
  },
  {
    id: "artifact-4",
    runId: "run-2038",
    type: "qa",
    label: "QA report",
    uri: "s3://zonnova-artifacts/run-2038/qa-report.json",
    size: "84 KB",
  },
];

export function getWorkspaceLabel(workspaceId: string): string {
  return workspaceId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function listActiveIdeas(): Idea[] {
  return ideas.filter((idea) => idea.status !== "discarded");
}

export function listDiscardedIdeas(): Idea[] {
  return ideas.filter((idea) => idea.status === "discarded");
}

export function getIdeaById(ideaId: string): Idea | undefined {
  return ideas.find((idea) => idea.id === ideaId);
}

export function listRunsForIdea(ideaId: string): Run[] {
  return runs.filter((run) => run.ideaId === ideaId);
}

export function getRunById(runId: string): Run | undefined {
  return runs.find((run) => run.id === runId);
}

export function listArtifactsForRun(runId: string): Artifact[] {
  return artifacts.filter((artifact) => artifact.runId === runId);
}

export function ideaStatusCounts() {
  return listActiveIdeas().reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}
