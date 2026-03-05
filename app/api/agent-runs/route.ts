import { NextResponse } from "next/server";

import { enqueueAgentRun, listWorkspaceAgentRuns } from "@/lib/agents/orchestrator";

export const dynamic = "force-dynamic";

type CreateAgentRunRequest = {
  workspaceId?: string;
  ideaText?: string;
};

function normalizeWorkspaceId(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "studio-lab";
  }

  return value.trim();
}

function normalizeIdeaText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  if (text.length < 8) {
    return null;
  }

  return text.slice(0, 6000);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();
  const runs = listWorkspaceAgentRuns(workspaceId || undefined);

  return NextResponse.json({ runs });
}

export async function POST(request: Request) {
  let body: CreateAgentRunRequest;

  try {
    body = (await request.json()) as CreateAgentRunRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const ideaText = normalizeIdeaText(body.ideaText);
  if (!ideaText) {
    return NextResponse.json(
      { error: "ideaText must be a non-empty string with at least 8 characters." },
      { status: 400 },
    );
  }

  const workspaceId = normalizeWorkspaceId(body.workspaceId);
  const run = enqueueAgentRun(workspaceId, ideaText);

  return NextResponse.json({ run }, { status: 202 });
}
