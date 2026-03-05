import Link from "next/link";
import { notFound } from "next/navigation";

import { getIdeaById, getRunById } from "@/lib/mock-data";

interface RebuildPageProps {
  params: Promise<{ workspaceId: string; runId: string }>;
}

export default async function RebuildPage({ params }: RebuildPageProps) {
  const { workspaceId, runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    notFound();
  }

  const idea = getIdeaById(run.ideaId);

  if (!idea) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
          Rebuild
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{idea.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          Tweak requirements and launch a fresh autonomous run.
        </p>
      </header>

      <form className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/90 p-6">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Current constraints</span>
          <textarea
            rows={7}
            defaultValue={idea.assumptions.join("\n")}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#fdfcf8] px-4 py-3 text-sm leading-relaxed outline-none ring-[var(--accent)]/50 transition focus:ring-2"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">Extra instruction for this run</span>
          <textarea
            rows={4}
            placeholder="Example: keep dependencies minimal and focus on mobile-first layout quality."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#fdfcf8] px-4 py-3 text-sm leading-relaxed outline-none ring-[var(--accent)]/50 transition focus:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Budget cap (USD)</span>
            <input
              type="number"
              defaultValue="10"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#fdfcf8] px-4 py-3 text-sm outline-none ring-[var(--accent)]/50 transition focus:ring-2"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Max runtime (minutes)</span>
            <input
              type="number"
              defaultValue="180"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#fdfcf8] px-4 py-3 text-sm outline-none ring-[var(--accent)]/50 transition focus:ring-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Trigger rebuild
          </button>
          <Link
            href={`/w/${workspaceId}/runs/${run.id}/artifacts`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-semibold hover:bg-[#f5f1e8]"
          >
            Back to artifacts
          </Link>
        </div>
      </form>
    </div>
  );
}
