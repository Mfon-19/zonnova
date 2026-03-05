"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEMO_WORKSPACE_ID = "studio-lab";
const NOTE_WIDTH = 286;
const AUTO_START_DELAY_MS = 4500;
const RUN_POLL_INTERVAL_MS = 1600;

const NOTE_STYLES = [
  {
    card: "bg-[#fff8cf] border-[#d4c98a]",
    grip: "bg-[#f4eaaf] text-[#6f6331]",
  },
  {
    card: "bg-[#dcf5ec] border-[#9cd5c0]",
    grip: "bg-[#c7eada] text-[#2f6d59]",
  },
  {
    card: "bg-[#ffe8dc] border-[#e1baa3]",
    grip: "bg-[#ffd7c4] text-[#8b4f34]",
  },
] as const;

type NotebookNote = {
  id: string;
  x: number;
  y: number;
  text: string;
  styleIndex: number;
  buildStatus: NoteBuildStatus;
  latestRunId?: string;
};

type NoteBuildStatus = "idle" | "queued" | "building" | "ready" | "failed";

type PanState = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

type DragState = {
  noteId: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type BuildTimers = {
  kickoff?: number;
  poll?: number;
};

const INITIAL_NOTES: NotebookNote[] = [
  {
    id: "starter-1",
    x: 120,
    y: 170,
    text: "Context store across codex, cursor, claude, and chat apps.",
    styleIndex: 0,
    buildStatus: "idle",
  },
  {
    id: "starter-2",
    x: 520,
    y: 320,
    text: "Idea notebook that builds the app and records a demo automatically.",
    styleIndex: 1,
    buildStatus: "idle",
  },
  {
    id: "starter-3",
    x: 920,
    y: 140,
    text: "Voice-first intern prep coach with role-specific interview loops.",
    styleIndex: 2,
    buildStatus: "idle",
  },
];

function makeNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}`;
}

function hasNoteContent(value: string) {
  return value.trim().length > 0;
}

type AgentRunStatus = "queued" | "running" | "completed" | "failed";

type AgentRunResponse = {
  run?: {
    id?: string;
    status?: AgentRunStatus;
  };
};

function mapAgentRunStatusToNoteStatus(status: AgentRunStatus): NoteBuildStatus {
  if (status === "queued") {
    return "queued";
  }

  if (status === "running") {
    return "building";
  }

  if (status === "completed") {
    return "ready";
  }

  return "failed";
}

export function InfiniteNotebookLanding() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<PanState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const notesRef = useRef<NotebookNote[]>(INITIAL_NOTES);
  const buildTimersRef = useRef<Record<string, BuildTimers>>({});

  const [notes, setNotes] = useState<NotebookNote[]>(INITIAL_NOTES);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isCompletedTrayOpen, setIsCompletedTrayOpen] = useState(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const clearBuildTimers = useCallback((noteId: string) => {
    const timers = buildTimersRef.current[noteId];
    if (!timers) {
      return;
    }

    if (timers.kickoff) {
      window.clearTimeout(timers.kickoff);
    }
    if (timers.poll) {
      window.clearInterval(timers.poll);
    }

    delete buildTimersRef.current[noteId];
  }, []);

  const clearAllBuildTimers = useCallback(() => {
    Object.keys(buildTimersRef.current).forEach((noteId) => {
      clearBuildTimers(noteId);
    });
  }, [clearBuildTimers]);

  const startPollingRun = useCallback(
    (noteId: string, runId: string) => {
      const timers = buildTimersRef.current[noteId] ?? {};

      timers.poll = window.setInterval(async () => {
        try {
          const response = await fetch(`/api/agent-runs/${runId}`, {
            method: "GET",
            cache: "no-store",
          });

          if (!response.ok) {
            return;
          }

          const payload = (await response.json()) as AgentRunResponse;
          const status = payload.run?.status;

          if (!status) {
            return;
          }

          const nextStatus = mapAgentRunStatusToNoteStatus(status);

          setNotes((current) =>
            current.map((note) =>
              note.id === noteId && note.latestRunId === runId
                ? {
                    ...note,
                    buildStatus: nextStatus,
                  }
                : note,
            ),
          );

          if (status === "completed" || status === "failed") {
            clearBuildTimers(noteId);
          }
        } catch {
          // Keep polling unless a terminal status arrives.
        }
      }, RUN_POLL_INTERVAL_MS);

      buildTimersRef.current[noteId] = timers;
    },
    [clearBuildTimers],
  );

  const startRunPipeline = useCallback(
    (noteId: string, delayMs: number) => {
      clearBuildTimers(noteId);

      const timers: BuildTimers = {};

      timers.kickoff = window.setTimeout(async () => {
        const targetNote = notesRef.current.find((note) => note.id === noteId);
        if (!targetNote || !hasNoteContent(targetNote.text)) {
          delete buildTimersRef.current[noteId];
          return;
        }

        setNotes((current) =>
          current.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  buildStatus: "queued",
                  latestRunId: undefined,
                }
              : note,
          ),
        );

        try {
          const createResponse = await fetch("/api/agent-runs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              workspaceId: DEMO_WORKSPACE_ID,
              ideaText: targetNote.text,
            }),
          });

          if (!createResponse.ok) {
            throw new Error("Failed to enqueue run.");
          }

          const payload = (await createResponse.json()) as AgentRunResponse;
          const runId = payload.run?.id;

          if (!runId) {
            throw new Error("Run ID missing from response.");
          }

          setNotes((current) =>
            current.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    buildStatus: "queued",
                    latestRunId: runId,
                  }
                : note,
            ),
          );

          startPollingRun(noteId, runId);
        } catch {
          setNotes((current) =>
            current.map((note) =>
              note.id === noteId
                ? {
                  ...note,
                    buildStatus: "failed",
                }
                : note,
            ),
          );
          delete buildTimersRef.current[noteId];
        }
      }, delayMs);

      buildTimersRef.current[noteId] = timers;
    },
    [clearBuildTimers, startPollingRun],
  );

  useEffect(
    () => () => {
      clearAllBuildTimers();
    },
    [clearAllBuildTimers],
  );

  const createNoteAtClientPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const currentOffset = offsetRef.current;

    const note: NotebookNote = {
      id: makeNoteId(),
      x: clientX - rect.left - currentOffset.x - NOTE_WIDTH / 2,
      y: clientY - rect.top - currentOffset.y - 36,
      text: "",
      styleIndex: Math.floor(Math.random() * NOTE_STYLES.length),
      buildStatus: "idle",
    };

    setNotes((current) => [...current, note]);
    setActiveNoteId(note.id);
  }, []);

  const updateNoteText = useCallback(
    (noteId: string, text: string) => {
      const contentPresent = hasNoteContent(text);

      setNotes((current) =>
        current.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  text,
                  buildStatus: "idle",
                  latestRunId: undefined,
                }
              : note,
        ),
      );

      clearBuildTimers(noteId);

      if (contentPresent) {
        startRunPipeline(noteId, AUTO_START_DELAY_MS);
      }
    },
    [clearBuildTimers, startRunPipeline],
  );

  const deleteNote = useCallback((noteId: string) => {
    clearBuildTimers(noteId);
    setNotes((current) => current.filter((note) => note.id !== noteId));

    setActiveNoteId((current) => {
      if (current === noteId) {
        return null;
      }

      return current;
    });
  }, [clearBuildTimers]);

  const retryBuild = useCallback(
    (noteId: string) => {
      const targetNote = notesRef.current.find((note) => note.id === noteId);
      if (!targetNote || !hasNoteContent(targetNote.text)) {
        return;
      }

      startRunPipeline(noteId, 350);
    },
    [startRunPipeline],
  );

  const startDraggingNote = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, noteId: string) => {
      event.preventDefault();
      event.stopPropagation();

      const note = notes.find((item) => item.id === noteId);
      if (!note) {
        return;
      }

      dragRef.current = {
        noteId,
        startX: event.clientX,
        startY: event.clientY,
        originX: note.x,
        originY: note.y,
      };

      setActiveNoteId(noteId);
    },
    [notes],
  );

  const onCanvasPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("[data-note-card='true']")) {
      return;
    }

    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
      moved: false,
    };

    setIsPanning(true);
    setActiveNoteId(null);
  }, []);

  const onCanvasDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-note-card='true']")) {
        return;
      }

      createNoteAtClientPoint(event.clientX, event.clientY);
    },
    [createNoteAtClientPoint],
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const dragState = dragRef.current;
      if (dragState) {
        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;

        setNotes((current) =>
          current.map((note) =>
            note.id === dragState.noteId
              ? {
                  ...note,
                  x: dragState.originX + deltaX,
                  y: dragState.originY + deltaY,
                }
              : note,
          ),
        );

        return;
      }

      const panState = panRef.current;
      if (!panState) {
        return;
      }

      const deltaX = event.clientX - panState.startX;
      const deltaY = event.clientY - panState.startY;

      if (!panState.moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        panRef.current = {
          ...panState,
          moved: true,
        };
      }

      setOffset({
        x: panState.originX + deltaX,
        y: panState.originY + deltaY,
      });
    };

    const onPointerUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
      }

      const panState = panRef.current;
      if (!panState) {
        return;
      }

      panRef.current = null;
      setIsPanning(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const notebookBackground = useMemo(() => {
    const xOffset = ((offset.x % 320) + 320) % 320;
    const yOffset = ((offset.y % 34) + 34) % 34;

    return {
      backgroundColor: "#fffdf5",
      backgroundImage:
        "linear-gradient(transparent 33px, rgba(83, 137, 178, 0.26) 34px), linear-gradient(90deg, rgba(222, 119, 119, 0.32) 1px, transparent 1px)",
      backgroundSize: "100% 34px, 320px 100%",
      backgroundPosition: `0 ${yOffset}px, ${xOffset}px 0`,
    };
  }, [offset.x, offset.y]);

  const completedNotes = useMemo(
    () => notes.filter((note) => note.buildStatus === "ready" && note.latestRunId && hasNoteContent(note.text)),
    [notes],
  );

  const onClearNotes = useCallback(() => {
    clearAllBuildTimers();
    setNotes([]);
    setActiveNoteId(null);
  }, [clearAllBuildTimers]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(255,244,214,0.74),transparent_38%),radial-gradient(circle_at_88%_5%,rgba(198,239,227,0.78),transparent_32%)]" />

      <header className="pointer-events-none absolute top-0 left-0 z-20 flex w-full justify-end p-4 sm:p-6">
        <div className="pointer-events-auto flex items-start gap-2">
          <button
            type="button"
            onClick={onClearNotes}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,252,245,0.92)] px-5 text-sm font-semibold text-[var(--ink)] shadow-[0_16px_28px_-24px_rgba(0,0,0,0.45)] transition hover:bg-white"
          >
            Clear notes
          </button>
          <Link
            href={`/w/${DEMO_WORKSPACE_ID}/ideas`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_16px_28px_-24px_rgba(0,0,0,0.45)] transition hover:brightness-105"
          >
            Enter workspace
          </Link>
        </div>
      </header>

      <div
        ref={canvasRef}
        className={`relative h-screen w-full overflow-hidden select-none touch-none ${isPanning ? "cursor-grabbing" : "cursor-crosshair"}`}
        style={notebookBackground}
        onPointerDown={onCanvasPointerDown}
        onDoubleClick={onCanvasDoubleClick}
      >
        {notes.map((note) => {
          const styleTokens = NOTE_STYLES[note.styleIndex];
          const isFocused = activeNoteId === note.id;

          return (
            <article
              key={note.id}
              data-note-card="true"
              className={`absolute w-[286px] rounded-xl border p-0 shadow-[0_24px_35px_-32px_rgba(24,32,35,0.7)] transition ${styleTokens.card} ${isFocused ? "ring-2 ring-[#1f8d74]/40" : ""}`}
              style={{
                transform: `translate(${note.x + offset.x}px, ${note.y + offset.y}px)`,
              }}
              onPointerDown={() => setActiveNoteId(note.id)}
            >
              <div className={`flex items-center justify-between rounded-t-xl border-b px-3 py-2 ${styleTokens.grip}`}>
                <button
                  type="button"
                  onPointerDown={(event) => startDraggingNote(event, note.id)}
                  className="rounded-md border border-current/30 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase"
                >
                  drag
                </button>
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="rounded-full px-2 text-xs font-semibold transition hover:bg-black/10"
                  aria-label="Delete note"
                >
                  x
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(event) => updateNoteText(note.id, event.target.value)}
                placeholder="Write your idea..."
                autoFocus={isFocused && note.text.length === 0}
                className="h-44 w-full resize-none rounded-b-xl bg-transparent px-3 py-3 text-sm leading-relaxed text-[#2d3129] outline-none"
              />
              <div
                className="flex flex-wrap items-center gap-2 border-t border-black/10 px-3 py-2"
                onPointerDown={(event) => event.stopPropagation()}
              >
                {hasNoteContent(note.text) && note.buildStatus === "idle" ? (
                  <p className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#4d5561]">
                    Auto-build starts after 4.5s idle
                  </p>
                ) : null}
                {note.buildStatus === "queued" ? (
                  <p className="rounded-full bg-[#e2e8f0] px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#334155]">
                    Queued
                  </p>
                ) : null}
                {note.buildStatus === "building" ? (
                  <p className="rounded-full bg-[#ffedd5] px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9a3412]">
                    Building...
                  </p>
                ) : null}
                {note.buildStatus === "failed" ? (
                  <button
                    type="button"
                    onClick={() => retryBuild(note.id)}
                    className="rounded-full bg-[#fee2e2] px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#be123c] transition hover:bg-[#fecaca]"
                  >
                    Retry build
                  </button>
                ) : null}
                {note.buildStatus === "ready" && note.latestRunId ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#166534]">
                      Done
                    </p>
                    <Link
                      href={`/w/${DEMO_WORKSPACE_ID}/runs/${note.latestRunId}`}
                      className="rounded-full border border-black/15 bg-white/75 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#1f2937] transition hover:bg-white"
                    >
                      Open build
                    </Link>
                    <Link
                      href={`/w/${DEMO_WORKSPACE_ID}/runs/${note.latestRunId}/artifacts`}
                      className="rounded-full border border-black/15 bg-white/75 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#1f2937] transition hover:bg-white"
                    >
                      Watch demo
                    </Link>
                    <button
                      type="button"
                      onClick={() => retryBuild(note.id)}
                      className="rounded-full border border-black/15 bg-white/75 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#1f2937] transition hover:bg-white"
                    >
                      Rebuild
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#d8d6cc] bg-[rgba(255,252,245,0.9)] px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
        Double-click empty paper to add note • Type and pause to auto-build • Drag paper to pan
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 z-20 sm:right-6 sm:bottom-6">
        <div className="pointer-events-auto flex max-w-xs flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setIsCompletedTrayOpen((current) => !current)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,252,245,0.95)] px-4 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--ink)] shadow-[0_16px_28px_-24px_rgba(0,0,0,0.45)] transition hover:bg-white"
          >
            Completed ({completedNotes.length})
          </button>
          {isCompletedTrayOpen ? (
            <div className="w-full min-w-[248px] rounded-2xl border border-[var(--line)] bg-[rgba(255,252,245,0.97)] p-3 shadow-[0_24px_40px_-28px_rgba(0,0,0,0.55)] backdrop-blur">
              {completedNotes.length === 0 ? (
                <p className="text-xs font-medium text-[var(--muted-ink)]">
                  No completed builds yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {completedNotes.map((note) => {
                    const ideaTitle = note.text.split("\n")[0]?.trim() || "Untitled idea";

                    return (
                      <article key={`${note.id}-${note.latestRunId}`} className="rounded-xl border border-black/8 bg-white/80 p-2">
                        <p className="truncate text-xs font-semibold text-[var(--ink)]">{ideaTitle}</p>
                        {note.latestRunId ? (
                          <div className="mt-2 flex items-center gap-2">
                            <Link
                              href={`/w/${DEMO_WORKSPACE_ID}/runs/${note.latestRunId}`}
                              className="rounded-full border border-black/15 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--ink)] transition hover:bg-[#f8f6ef]"
                            >
                              Open
                            </Link>
                            <Link
                              href={`/w/${DEMO_WORKSPACE_ID}/runs/${note.latestRunId}/artifacts`}
                              className="rounded-full border border-black/15 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--ink)] transition hover:bg-[#f8f6ef]"
                            >
                              Demo
                            </Link>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
