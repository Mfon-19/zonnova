import type { AgentDefinition } from "@/lib/agents/types";
import { compactSentence, sleep } from "@/lib/agents/utils";

function extractProblemStatement(input: string): string {
  const firstLine = compactSentence(input.split("\n")[0] ?? "");
  return firstLine.length > 0 ? firstLine : "User provided a short idea note.";
}

export const AGENT_PIPELINE: AgentDefinition[] = [
  {
    id: "normalize_idea",
    label: "Normalize idea",
    execute: async ({ run, log }) => {
      await sleep(650);
      const statement = extractProblemStatement(run.ideaText);
      const normalizedIdea = `Build a focused MVP around: "${statement}". Prioritize measurable user value, a clear success path, and a demo-ready interaction loop.`;

      log("Parsed raw note into a concrete product intent.");

      return {
        detail: "Idea normalized into product intent and constraints.",
        outputs: {
          normalizedIdea,
        },
      };
    },
  },
  {
    id: "generate_spec",
    label: "Generate spec",
    execute: async ({ outputs, log }) => {
      await sleep(900);

      const base = outputs.normalizedIdea ?? "Build a demo-ready MVP from the captured note.";
      const specMarkdown = [
        "# Product Spec",
        "",
        `## Problem`,
        base,
        "",
        "## Must-Have Requirements",
        "- One core user flow that can be demoed in under 60 seconds.",
        "- Clear output artifact proving the flow is complete.",
        "- Recovery path for malformed user input.",
        "",
        "## Non-Goals",
        "- Full production hardening.",
        "- Multi-tenant auth and billing.",
      ].join("\n");

      log("Generated initial requirements with acceptance-ready scope.");

      return {
        detail: "Spec drafted with must-haves and non-goals.",
        outputs: {
          specMarkdown,
        },
      };
    },
  },
  {
    id: "generate_plan",
    label: "Generate implementation plan",
    execute: async ({ outputs, log }) => {
      await sleep(850);

      const planMarkdown = [
        "# Implementation Plan",
        "",
        "1. Build core UX flow and primary route.",
        "2. Add run-state storage and status transitions.",
        "3. Generate output artifacts and expose links.",
        "4. Run smoke + type checks and package demo story.",
        "",
        "## Inputs",
        outputs.specMarkdown ? "- Spec available" : "- Spec inferred from idea",
      ].join("\n");

      log("Created phased execution plan for build + QA + demo.");

      return {
        detail: "Plan produced with ordered implementation milestones.",
        outputs: {
          planMarkdown,
        },
      };
    },
  },
  {
    id: "build_app",
    label: "Build app",
    execute: async ({ run, log }) => {
      await sleep(1100);
      const buildSummary = "Prototype scaffold generated with feature-complete happy path.";

      log("Build artifacts generated in sandbox and linked.");

      return {
        detail: "Sandbox build completed with runnable preview.",
        outputs: {
          buildSummary,
        },
        artifacts: {
          previewUrl: `https://preview.zonnova.app/${run.id}`,
          repoUri: `s3://zonnova-artifacts/${run.id}/repo.zip`,
        },
      };
    },
  },
  {
    id: "run_qa",
    label: "Run QA",
    execute: async ({ run, log }) => {
      await sleep(750);
      const qaSummary = "Lint and smoke checks passed. No blocking regressions detected.";

      log("Quality checks passed against generated acceptance criteria.");

      return {
        detail: "Automated QA complete with pass verdict.",
        outputs: {
          qaSummary,
        },
        artifacts: {
          qaReportUri: `s3://zonnova-artifacts/${run.id}/qa-report.json`,
        },
      };
    },
  },
  {
    id: "record_demo",
    label: "Record demo",
    execute: async ({ run, outputs, log }) => {
      await sleep(900);
      const demoScript = [
        "Open the app homepage.",
        "Trigger the primary workflow end-to-end.",
        "Show generated output artifact.",
        "Close with success criteria and next iteration scope.",
      ].join("\n");

      log("Demo walkthrough script generated and video artifact attached.");

      return {
        detail: "Demo recording prepared with a concise script.",
        outputs: {
          demoScript: outputs.demoScript ?? demoScript,
        },
        artifacts: {
          demoVideoUri: `s3://zonnova-artifacts/${run.id}/demo.webm`,
        },
      };
    },
  },
];
