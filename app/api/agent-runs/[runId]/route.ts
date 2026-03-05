import { NextResponse } from "next/server";

import { getAgentRunById } from "@/lib/agents/orchestrator";

export const dynamic = "force-dynamic";

interface RunRouteProps {
  params: Promise<{ runId: string }>;
}

export async function GET(_request: Request, { params }: RunRouteProps) {
  const { runId } = await params;
  const run = getAgentRunById(runId);

  if (!run) {
    return NextResponse.json(
      { error: `Run ${runId} was not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json({ run });
}
