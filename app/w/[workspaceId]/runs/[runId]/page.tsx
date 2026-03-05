import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusPill } from "@/components/status-pill";
import { getRunById } from "@/lib/mock-data";

interface RunPageProps {
  params: Promise<{ workspaceId: string; runId: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { workspaceId, runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
            Run Console
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{run.id}</h2>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Model mix: <span className="font-semibold text-[var(--ink)]">{run.modelMix}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={run.status} />
          <Link
            href={`/w/${workspaceId}/runs/${run.id}/artifacts`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold hover:bg-[#f6f1e8]"
          >
            View artifacts
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#f8f4ec] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Budget used</p>
          <p className="mt-2 text-2xl font-semibold">${run.budgetUsd.toFixed(2)}</p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#eef7f4] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Input tokens</p>
          <p className="mt-2 text-2xl font-semibold">{run.tokensIn.toLocaleString()}</p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#fff4eb] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">Output tokens</p>
          <p className="mt-2 text-2xl font-semibold">{run.tokensOut.toLocaleString()}</p>
        </div>
      </section>

      <section className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/90 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
          Stage Progress
        </h3>
        <div className="mt-4 space-y-3">
          {run.steps.map((step) => (
            <article
              key={step.id}
              className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#f9f6ef] p-3"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{step.label}</p>
                  <p className="text-sm text-[var(--muted-ink)]">{step.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  {step.durationSec ? (
                    <p className="text-xs font-mono text-[var(--muted-ink)]">
                      {step.durationSec}s
                    </p>
                  ) : null}
                  <StatusPill status={step.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#101516] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a6c7c2]">
          Execution Logs
        </h3>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#d3ebe6]">
          {run.logs.join("\n")}
        </pre>
      </section>
    </div>
  );
}
