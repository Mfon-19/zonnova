import Link from "next/link";
import { notFound } from "next/navigation";

import { getRunById, listArtifactsForRun } from "@/lib/mock-data";

interface ArtifactsPageProps {
  params: Promise<{ workspaceId: string; runId: string }>;
}

export default async function ArtifactsPage({ params }: ArtifactsPageProps) {
  const { workspaceId, runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    notFound();
  }

  const runArtifacts = listArtifactsForRun(run.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
            Artifacts
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{run.id}</h2>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Review the generated outputs and decide whether to keep or rebuild.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/w/${workspaceId}/runs/${run.id}`}
            className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold hover:bg-[#f6f1e8]"
          >
            Back to run
          </Link>
          <Link
            href={`/w/${workspaceId}/runs/${run.id}/rebuild`}
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:brightness-105"
          >
            Rebuild
          </Link>
        </div>
      </header>

      <section className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-gradient-to-br from-[#0f3a34] via-[#15453f] to-[#0d2925] p-6 text-[#e9fffa]">
        <p className="text-xs uppercase tracking-[0.16em] text-[#9ed9cd]">Demo Preview</p>
        <h3 className="mt-2 text-2xl font-semibold">Autonomous build walkthrough</h3>
        <p className="mt-2 max-w-2xl text-sm text-[#cde9e2]">
          This panel will play the generated browser demo video. For now, this is a visual placeholder for the playback surface.
        </p>
        <div className="mt-6 flex h-52 items-center justify-center rounded-[var(--radius-sm)] border border-[#2f7469] bg-[#0f2a26] text-sm text-[#9ed9cd]">
          video player placeholder
        </div>
      </section>

      <section className="grid gap-3">
        {runArtifacts.length === 0 ? (
          <p className="text-sm text-[var(--muted-ink)]">No artifacts uploaded yet.</p>
        ) : (
          runArtifacts.map((artifact) => (
            <article
              key={artifact.id}
              className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/90 p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                    {artifact.type}
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-[var(--ink)]">{artifact.label}</h4>
                </div>
                <p className="text-sm text-[var(--muted-ink)]">{artifact.size}</p>
              </div>
              <p className="mt-2 break-all rounded-md bg-[#f7f3ea] px-3 py-2 font-mono text-xs text-[var(--muted-ink)]">
                {artifact.uri}
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
