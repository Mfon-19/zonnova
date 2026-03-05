"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEMO_WORKSPACE_ID = "studio-lab";
const NOTE_WIDTH = 286;

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
};

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

const INITIAL_NOTES: NotebookNote[] = [
  {
    id: "starter-1",
    x: 120,
    y: 170,
    text: "Context store across codex, cursor, claude, and chat apps.",
    styleIndex: 0,
  },
  {
    id: "starter-2",
    x: 520,
    y: 320,
    text: "Idea notebook that builds the app and records a demo automatically.",
    styleIndex: 1,
  },
  {
    id: "starter-3",
    x: 920,
    y: 140,
    text: "Voice-first intern prep coach with role-specific mock interview loops.",
    styleIndex: 2,
  },
];

function makeNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}`;
}

export function InfiniteNotebookLanding() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<PanState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const [notes, setNotes] = useState<NotebookNote[]>(INITIAL_NOTES);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

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
    };

    setNotes((current) => [...current, note]);
    setActiveNoteId(note.id);
  }, []);

  const updateNoteText = useCallback((noteId: string, text: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              text,
            }
          : note,
      ),
    );
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));

    setActiveNoteId((current) => {
      if (current === noteId) {
        return null;
      }

      return current;
    });
  }, []);

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
  }, [createNoteAtClientPoint]);

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(255,244,214,0.74),transparent_38%),radial-gradient(circle_at_88%_5%,rgba(198,239,227,0.78),transparent_32%)]" />

      <header className="pointer-events-none absolute top-0 left-0 z-20 flex w-full justify-end p-4 sm:p-6">
        <div className="pointer-events-auto flex items-start gap-2">
          <button
            type="button"
            onClick={() => setNotes([])}
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
            </article>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#d8d6cc] bg-[rgba(255,252,245,0.9)] px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
        Double-click empty paper to add note • Drag paper to pan
      </div>
    </div>
  );
}
