import { Settings, Save, Trash2, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="text-center sm:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:justify-start">
          <Settings className="h-4 w-4" />
          Settings
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
          Workspace controls
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--muted-ink)]">
          Configure retention and recovery for your anonymous workspace.
        </p>
      </header>

      <section className="space-y-6 overflow-hidden rounded-[var(--radius-lg)] border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl sm:p-8">
        <label className="block space-y-2.5">
          <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
            Data retention
          </span>
          <div className="relative">
            <select className="w-full appearance-none rounded-[var(--radius-md)] border border-white/40 bg-white/80 px-4 py-3.5 text-base text-[var(--ink)] shadow-inner outline-none backdrop-blur-sm transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/15">
              <option>7 days</option>
              <option>14 days</option>
              <option>30 days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="h-4 w-4 text-[var(--muted-ink)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-4 rounded-[var(--radius-md)] border border-white/40 bg-white/50 p-5 shadow-sm transition-all hover:bg-white/80">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[var(--line)] bg-white transition-all checked:border-[var(--accent)] checked:bg-[var(--accent)] hover:border-[var(--accent)]"
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
              width="12"
              height="10"
              viewBox="0 0 12 10"
              fill="none">
              <path
                d="M1.5 5.5L4.5 8.5L10.5 1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm leading-relaxed text-[var(--ink)]">
            Auto-delete failed runs older than 72 hours to keep the workspace
            clean.
          </span>
        </label>

        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-transparent p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            <Key className="h-4 w-4" />
            Recovery key
          </p>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-white/50 bg-white/60 p-4 shadow-inner backdrop-blur-sm">
            <p className="font-mono text-base font-medium tracking-wider text-[var(--ink)]">
              ZNVA-3R89-K7PA-1M2X
            </p>
          </div>
          <p className="mt-3 text-sm text-[var(--muted-ink)]">
            Save this key if you want to restore this anonymous workspace later.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="group flex h-12 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100/50 hover:shadow-md active:scale-95">
            <Trash2 className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6" />
            Delete workspace
          </button>

          <button
            type="button"
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-white shadow-md shadow-[var(--accent)]/30 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-[var(--accent)]/40">
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </div>
      </section>
    </div>
  );
}
