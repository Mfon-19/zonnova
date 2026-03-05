import Link from "next/link";
import { Zap, Sparkles, X } from "lucide-react";

interface NewIdeaPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function NewIdeaPage({ params }: NewIdeaPageProps) {
  const { workspaceId } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="text-center sm:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:justify-start">
          <Sparkles className="h-4 w-4" />
          New Idea
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
          Capture it fast
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--muted-ink)]">
          Keep it messy. The agent will convert this note into requirements and
          an implementation plan.
        </p>
      </header>

      <form className="space-y-6 overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl sm:p-8">
        <label className="block space-y-2.5">
          <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
            Idea title
          </span>
          <input
            type="text"
            placeholder="ContextMesh Notebook"
            className="w-full rounded-[var(--radius-md)] border border-white/40 bg-white/80 px-4 py-3.5 text-base text-[var(--ink)] shadow-inner outline-none backdrop-blur-sm transition-all placeholder:text-[var(--muted-ink)] focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/15"
          />
        </label>

        <label className="block space-y-2.5">
          <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
            Raw note
          </span>
          <textarea
            rows={8}
            placeholder="When developers capture an idea, an agent should write requirements, build the app, and record a short demo in the browser..."
            className="w-full resize-y rounded-[var(--radius-md)] border border-white/40 bg-white/80 px-4 py-3.5 text-base leading-relaxed text-[var(--ink)] shadow-inner outline-none backdrop-blur-sm transition-all placeholder:text-[var(--muted-ink)] focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/15"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2.5">
            <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
              Budget cap (USD)
            </span>
            <input
              type="number"
              defaultValue="10"
              className="w-full rounded-[var(--radius-md)] border border-white/40 bg-white/80 px-4 py-3.5 text-base text-[var(--ink)] shadow-inner outline-none backdrop-blur-sm transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/15"
            />
          </label>
          <label className="block space-y-2.5">
            <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
              Runtime cap (minutes)
            </span>
            <input
              type="number"
              defaultValue="180"
              className="w-full rounded-[var(--radius-md)] border border-white/40 bg-white/80 px-4 py-3.5 text-base text-[var(--ink)] shadow-inner outline-none backdrop-blur-sm transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/15"
            />
          </label>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm leading-relaxed text-blue-900">
          <strong>Anonymous mode is enabled.</strong> This workspace is linked
          to your current browser until you export or claim it.
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            href={`/w/${workspaceId}/ideas`}
            className="group flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/50 px-6 text-sm font-semibold text-[var(--ink)] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95">
            <X className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="button"
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-white shadow-md shadow-[var(--accent)]/30 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-[var(--accent)]/40">
            <Zap className="h-4 w-4 fill-current text-yellow-300" />
            Start autonomous build
          </button>
        </div>
      </form>
    </div>
  );
}
