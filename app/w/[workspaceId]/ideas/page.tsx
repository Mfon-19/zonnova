import Link from "next/link";
import {
  Plus,
  ListStart,
  Map,
  Hammer,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
} from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { ideaStatusCounts, listActiveIdeas } from "@/lib/mock-data";

interface IdeasPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function IdeasPage({ params }: IdeasPageProps) {
  const { workspaceId } = await params;
  const ideas = listActiveIdeas();
  const counts = ideaStatusCounts();

  const statCards = [
    {
      label: "Queued",
      value: counts.queued ?? 0,
      icon: ListStart,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    },
    {
      label: "Planning",
      value: counts.planning ?? 0,
      icon: Map,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Building",
      value: counts.building ?? 0,
      icon: Hammer,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Ready",
      value: counts.ready ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Failed",
      value: counts.failed ?? 0,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]"></span>
            Idea Inbox
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            Build queue
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-ink)]">
            Every idea moves through spec, plan, build, and demo without pausing
            for manual approvals.
          </p>
        </div>

        <Link
          href={`/w/${workspaceId}/ideas/new`}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-md shadow-[var(--accent)]/20 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-[var(--accent)]/30">
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New idea
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                  {item.label}
                </p>
                <div className={`rounded-xl p-2 ${item.bg}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
              <p className="mt-3 text-4xl font-bold text-[var(--ink)] tracking-tight">
                {item.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5">
        {ideas.map((idea) => (
          <article
            key={idea.id}
            className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-xl hover:shadow-[var(--accent)]/5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-[var(--ink)]">
                    {idea.title}
                  </h3>
                  <StatusPill status={idea.status} />
                </div>
                <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted-ink)]">
                  {idea.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--line)] bg-white/50 px-3 py-1 text-xs font-medium tracking-wide text-[var(--muted-ink)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 md:min-w-48 md:items-end">
                <p className="text-xs font-medium text-[var(--muted-ink)]">
                  Updated{" "}
                  <span className="font-semibold text-[var(--ink)]">
                    {idea.updatedAt}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/w/${workspaceId}/ideas/${idea.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95">
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {idea.lastRunId ? (
                    <Link
                      href={`/w/${workspaceId}/runs/${idea.lastRunId}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-95">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Run
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
