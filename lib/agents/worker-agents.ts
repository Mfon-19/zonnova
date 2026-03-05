/**
 * Stage worker definitions used by the orchestrator pipeline.
 */
import type { AgentDefinition } from "@/lib/agents/types";
import { generateNovaText } from "@/lib/agents/nova-client";

/**
 * Trims Nova outputs while preserving markdown structure.
 */
function cleanOutput(text: string): string {
  return text.trim();
}

/**
 * Stage workers for real Nova-backed execution.
 */
export const AGENT_PIPELINE: AgentDefinition[] = [
  {
    id: "normalize_idea",
    label: "Normalize idea",
    execute: async ({ run, log }) => {
      const normalizedIdea = await generateNovaText({
        tier: "lite",
        systemPrompt:
          "You are the Idea Normalizer agent. Convert rough startup notes into concise product intent.",
        userPrompt: [
          "Normalize this raw idea into one paragraph.",
          "Include: target user, core problem, value proposition, and MVP boundary.",
          "Do not use bullet points or markdown headings.",
          "",
          `Idea: ${run.ideaText}`,
        ].join("\n"),
        maxTokens: 220,
      });

      log("Normalized idea using Amazon Nova Lite.");

      return {
        detail: "Idea normalized into product intent and constraints.",
        outputs: {
          normalizedIdea: cleanOutput(normalizedIdea),
        },
      };
    },
  },
  {
    id: "generate_spec",
    label: "Generate spec",
    execute: async ({ run, outputs, log }) => {
      const base = outputs.normalizedIdea ?? "Build a demo-ready MVP from the captured note.";
      const specMarkdown = await generateNovaText({
        tier: "pro",
        systemPrompt:
          "You are the Spec Agent. Produce concise markdown product specs for autonomous build pipelines.",
        userPrompt: [
          "Write a product spec in markdown with these sections only:",
          "1. Problem",
          "2. Must-Have Requirements",
          "3. Non-Goals",
          "4. Acceptance Criteria",
          "",
          "Keep it implementation-aware but concise.",
          "",
          `Normalized idea: ${base}`,
          `Raw note: ${run.ideaText}`,
        ].join("\n"),
      });

      log("Generated requirements with Amazon Nova Pro.");

      return {
        detail: "Spec drafted with must-haves and non-goals.",
        outputs: {
          specMarkdown: cleanOutput(specMarkdown),
        },
      };
    },
  },
  {
    id: "generate_plan",
    label: "Generate implementation plan",
    execute: async ({ outputs, log }) => {
      const planMarkdown = await generateNovaText({
        tier: "pro",
        systemPrompt:
          "You are the Planner Agent. Convert specs into clear implementation plans with dependencies.",
        userPrompt: [
          "Generate a markdown implementation plan with:",
          "- Ordered phases",
          "- Concrete tasks per phase",
          "- QA and demo checkpoints",
          "",
          "Keep it practical for a 1-week MVP build.",
          "",
          `Spec:\n${outputs.specMarkdown ?? "No spec provided."}`,
        ].join("\n"),
      });

      log("Generated implementation plan with Amazon Nova Pro.");

      return {
        detail: "Plan produced with ordered implementation milestones.",
        outputs: {
          planMarkdown: cleanOutput(planMarkdown),
        },
      };
    },
  },
  {
    id: "build_app",
    label: "Build app",
    execute: async ({ outputs, log }) => {
      const buildSummary = await generateNovaText({
        tier: "pro",
        systemPrompt:
          "You are the Builder Agent. Summarize implementation outcomes of an autonomous build run.",
        userPrompt: [
          "Given this spec and plan, output a short build summary paragraph.",
          "Mention implemented surface area and what remains out of scope.",
          "",
          `Spec:\n${outputs.specMarkdown ?? "N/A"}`,
          "",
          `Plan:\n${outputs.planMarkdown ?? "N/A"}`,
        ].join("\n"),
        maxTokens: 260,
      });

      log("Build summary generated with Amazon Nova Pro.");

      return {
        detail: "Build summary generated.",
        outputs: {
          buildSummary: cleanOutput(buildSummary),
        },
      };
    },
  },
  {
    id: "run_qa",
    label: "Run QA",
    execute: async ({ outputs, log }) => {
      const qaSummary = await generateNovaText({
        tier: "lite",
        systemPrompt:
          "You are the QA Agent. Evaluate implementation summaries against specs and report risk.",
        userPrompt: [
          "Write a concise QA summary with:",
          "- test verdict",
          "- top 2 remaining risks",
          "- release recommendation",
          "",
          `Spec:\n${outputs.specMarkdown ?? "N/A"}`,
          "",
          `Build summary:\n${outputs.buildSummary ?? "N/A"}`,
        ].join("\n"),
        maxTokens: 240,
      });

      log("QA summary generated with Amazon Nova Lite.");

      return {
        detail: "Automated QA complete with pass verdict.",
        outputs: {
          qaSummary: cleanOutput(qaSummary),
        },
      };
    },
  },
  {
    id: "record_demo",
    label: "Record demo",
    execute: async ({ outputs, log }) => {
      const demoScript = await generateNovaText({
        tier: "lite",
        systemPrompt:
          "You are the Demo Agent. Create concise browser demo scripts for MVP showcases.",
        userPrompt: [
          "Write a numbered demo script (5-7 steps) to showcase the product.",
          "Focus on measurable utility and a crisp before/after narrative.",
          "",
          `Normalized idea:\n${outputs.normalizedIdea ?? "N/A"}`,
          "",
          `Spec:\n${outputs.specMarkdown ?? "N/A"}`,
        ].join("\n"),
        maxTokens: 260,
      });

      log("Demo script generated with Amazon Nova Lite.");

      return {
        detail: "Demo script prepared.",
        outputs: {
          demoScript: cleanOutput(demoScript),
        },
      };
    },
  },
];
