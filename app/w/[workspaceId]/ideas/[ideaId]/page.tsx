import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  History,
  Target,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { getIdeaById, listRunsForIdea } from "@/lib/mock-data";

interface IdeaDetailPageProps {
  params: Promise<{ workspaceId: string; ideaId: string }>;
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { workspaceId, ideaId } = await params;
  const idea = getIdeaById(ideaId);

  if (!idea) {
    notFound();
  }

  const runs = listRunsForIdea(idea.id);
  const rebuildHref = idea.lastRunId
    ? `/w/${workspaceId}/runs/${idea.lastRunId}/rebuild`
    : `/w/${workspaceId}/ideas/new`;

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        <Link
          href={`/w/${workspaceId}/ideas`}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:-translate-x-1 hover:shadow-md active:scale-95">
          <ArrowLeft className="h-4 w-4" />
          Back to inbox
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[var(--ink)]">
            {idea.title}
          </h2>
          <StatusPill status={idea.status} />
        </div>

        <p className="max-w-4xl text-base leading-relaxed text-[var(--muted-ink)]">
          {idea.summary}
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            <Target className="h-4 w-4" />
            MVP Scope
          </h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink)]">
            {idea.mvpScope.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl bg-white/50 px-4 py-3 shadow-sm">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-amber-600">
            <Lightbulb className="h-4 w-4" />
            Working Assumptions
          </h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink)]">
            {idea.assumptions.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl bg-white/50 px-4 py-3 shadow-sm">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
            <History className="h-4 w-4" />
            Run History
          </h3>
          <Link
            href={rebuildHref}
            className="group inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-5 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95">
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            Rebuild idea
          </Link>
        </div>

        {runs.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-white/30 py-12">
            <History className="h-8 w-8 text-[var(--line)]" />
            <p className="mt-3 text-sm font-medium text-[var(--muted-ink)]">
              No runs yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {runs.map((run) => (
              <article
                key={run.id}
                className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/50 p-5 shadow-sm transition-all hover:bg-white/80 hover:shadow-md">
                <div className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-base font-bold text-[var(--ink)]">
                      {run.id}
                    </p>
                    <p className="text-xs font-medium text-[var(--muted-ink)]">
                      {run.startedAt}{" "}
                      {run.endedAt ? `→ ${run.endedAt}` : "→ in progress"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusPill status={run.status} />
                    <Link
                      href={`/w/${workspaceId}/runs/${run.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--ink)] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-95">
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
