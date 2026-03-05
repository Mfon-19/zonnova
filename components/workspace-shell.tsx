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
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/60 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Anonymous Workspace
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                  {getWorkspaceLabel(workspaceId)}
                </h1>
              </div>
              <span className="rounded-full border border-[var(--accent)]/10 bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)] shadow-sm">
                no login
              </span>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                      active
                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                        : "border border-[var(--line)] bg-white/80 text-[var(--muted-ink)] hover:bg-white hover:text-[var(--ink)]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors ${active ? "text-white" : "text-[var(--muted-ink)] group-hover:text-[var(--accent)]"}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="min-h-[85vh] rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/60 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
