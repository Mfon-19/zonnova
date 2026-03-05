import type { IdeaStatus, RunStatus, RunStepStatus } from "@/lib/mock-data";

type Status = IdeaStatus | RunStatus | RunStepStatus;

const STATUS_THEME: Record<Status, string> = {
  queued: "bg-slate-100 text-slate-700 border-slate-200",
  planning: "bg-cyan-100 text-cyan-800 border-cyan-200",
  building: "bg-amber-100 text-amber-800 border-amber-200",
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
  discarded: "bg-zinc-200 text-zinc-700 border-zinc-300",
  running: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${STATUS_THEME[status]}`}
    >
      {status}
    </span>
  );
}
