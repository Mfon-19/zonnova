"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Inbox, PlusCircle, Trash2, Settings } from "lucide-react";

import { getWorkspaceLabel } from "@/lib/mock-data";

interface WorkspaceShellProps {
  workspaceId: string;
  children: ReactNode;
}

export function WorkspaceShell({ workspaceId, children }: WorkspaceShellProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Idea Inbox", href: `/w/${workspaceId}/ideas`, icon: Inbox },
    {
      label: "New Idea",
      href: `/w/${workspaceId}/ideas/new`,
      icon: PlusCircle,
    },
    { label: "Trash", href: `/w/${workspaceId}/trash`, icon: Trash2 },
    { label: "Settings", href: `/w/${workspaceId}/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 lg:flex-row">
        <aside className="w-full rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/60 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:w-72 lg:p-6 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Anonymous Workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                {getWorkspaceLabel(workspaceId)}
              </h1>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)] border border-[var(--accent)]/10 shadow-sm">
              no login
            </span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-[var(--muted-ink)]">
            This workspace is linked to your browser session. Save your recovery
            key in settings if you want to restore it later.
          </p>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                      : "text-[var(--muted-ink)] hover:bg-white hover:text-[var(--ink)] hover:shadow-sm"
                  }`}>
                  <Icon
                    className={`h-4 w-4 transition-colors ${active ? "text-white" : "text-[var(--muted-ink)] group-hover:text-[var(--accent)]"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/40 p-4 shadow-sm backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"></span>
              </span>
              Agent Limits
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-ink)]">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)]"></div>
                1 active run at a time
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)]"></div>
                $10 run budget cap
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--line)]"></div>
                3h runtime hard stop
              </li>
            </ul>
          </div>
        </aside>

        <main className="min-h-[85vh] flex-1 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/60 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6 lg:p-8 transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}
