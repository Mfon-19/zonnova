import { listDiscardedIdeas } from "@/lib/mock-data";
import { Trash2, RotateCcw, BoxSelect } from "lucide-react";

export default function TrashPage() {
  const discarded = listDiscardedIdeas();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
            <Trash2 className="h-4 w-4" />
            Trash
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            Discarded ideas
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted-ink)]">
            Soft-deleted ideas stay here for seven days before permanent
            cleanup.
          </p>
        </div>
      </header>

      {discarded.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-white/40 bg-white/40 py-20 backdrop-blur-sm sm:py-32">
          <BoxSelect className="h-10 w-10 text-[var(--muted-ink)]/50" />
          <p className="mt-4 text-base font-medium text-[var(--muted-ink)]">
            Trash is empty.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {discarded.map((idea) => (
            <article
              key={idea.id}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 hover:shadow-md">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[var(--ink)]">
                    {idea.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-ink)] line-clamp-2">
                    {idea.summary}
                  </p>
                </div>
                <button
                  type="button"
                  className="group/btn inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/50 px-5 text-sm font-semibold text-[var(--ink)] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95 sm:w-auto">
                  <RotateCcw className="h-4 w-4 transition-transform group-hover/btn:-rotate-45" />
                  Restore
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
