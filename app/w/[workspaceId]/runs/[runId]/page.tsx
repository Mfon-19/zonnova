import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, PlayCircle, Sparkles } from "lucide-react";

import { getIdeaById, getRunById, listArtifactsForRun } from "@/lib/mock-data";

interface RunPageProps {
  params: Promise<{ workspaceId: string; runId: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { workspaceId, runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    notFound();
  }

  const idea = getIdeaById(run.ideaId);
  if (!idea) {
    notFound();
  }

  const runArtifacts = listArtifactsForRun(run.id);
  const demoArtifact =
    runArtifacts.find((artifact) => artifact.type === "video") ??
    runArtifacts.find((artifact) => artifact.type === "preview");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-4">
        <Link
          href={`/w/${workspaceId}/ideas`}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ideas
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Run Review
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {idea.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/w/${workspaceId}/runs/${run.id}/artifacts`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold hover:bg-[#f6f1e8]"
          >
            All artifacts
          </Link>
        </div>
      </header>

      <section className="rounded-[var(--radius-lg)] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          <Sparkles className="h-4 w-4" />
          Idea Description
        </h3>
        <p className="mt-4 text-base leading-relaxed text-[var(--ink)]">{idea.summary}</p>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
          <ClipboardList className="h-4 w-4" />
          Specs
        </h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#f9f6ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
              MVP Scope
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
              {idea.mvpScope.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[#f9f6ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-ink)]">
              Assumptions
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
              {idea.assumptions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[#2e7569] bg-gradient-to-br from-[#103e37] via-[#154d45] to-[#12342f] p-6 text-[#e9fffa]">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#b5e8dd]">
          <PlayCircle className="h-4 w-4" />
          Demo
        </h3>
        <div className="mt-5 rounded-[var(--radius-sm)] border border-[#2f7469] bg-[#0e2925] p-4">
          <div className="flex h-56 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[#3f8578] bg-[#0f2e29] text-center">
            <div>
              <p className="text-sm font-semibold text-[#cde9e2]">Demo Playback Surface</p>
              <p className="mt-1 text-xs text-[#9ed9cd]">
                Video rendering placeholder for autonomous browser walkthrough.
              </p>
            </div>
          </div>
          {demoArtifact ? (
            <div className="mt-4 space-y-1 text-xs">
              <p className="font-semibold uppercase tracking-[0.12em] text-[#b5e8dd]">
                {demoArtifact.label}
              </p>
              <p className="break-all rounded-md bg-black/20 px-3 py-2 font-mono text-[#dbf6f0]">
                {demoArtifact.uri}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#cde9e2]">Demo artifact is still being prepared.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/w/${workspaceId}/runs/${run.id}/artifacts`}
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#103730] transition hover:bg-[#e7f8f3]"
            >
              Open demo artifacts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
