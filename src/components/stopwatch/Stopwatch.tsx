import { useEffect, useReducer, useRef, useState, useCallback, type ReactNode } from "react";
import { Play, Pause, RotateCcw, Square, FastForward } from "lucide-react";
import { TimeDisplay } from "./TimeDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Status = "idle" | "running" | "paused";

type State = {
  status: Status;
  elapsed: number;
  startedAt: number | null;
  startedAtWall: number | null; // wall-clock ms (Date.now) when first started
};

type Action =
  | { type: "START"; now: number; wall: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "RESET" };

const initialState: State = {
  status: "idle",
  elapsed: 0,
  startedAt: null,
  startedAtWall: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return {
        status: "running",
        elapsed: 0,
        startedAt: action.now,
        startedAtWall: action.wall,
      };
    case "PAUSE":
      if (state.status !== "running" || state.startedAt === null) return state;
      return {
        ...state,
        status: "paused",
        elapsed: state.elapsed + (action.now - state.startedAt),
        startedAt: null,
      };
    case "RESUME":
      if (state.status !== "paused") return state;
      return { ...state, status: "running", startedAt: action.now };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function computeMs(state: State, now: number) {
  if (state.status === "running" && state.startedAt !== null) {
    return state.elapsed + (now - state.startedAt);
  }
  return state.elapsed;
}

const baseBtn =
  "inline-flex min-h-14 items-center justify-center gap-3 rounded-lg px-10 py-3 text-xl font-semibold shadow-sm ring-offset-2 ring-offset-background transition-all duration-150 hover:shadow-md hover:ring-2 hover:ring-foreground/15 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const startBtn = `${baseBtn} bg-success text-success-foreground`;
const finishBtn = `${baseBtn} bg-destructive text-destructive-foreground`;
const pauseBtn = `${baseBtn} bg-warning text-warning-foreground`;
const resetBtn = `${baseBtn} bg-info text-info-foreground`;
const resumeBtn = `${baseBtn} bg-success text-success-foreground`;

type ShortcutTooltipProps = {
  label: string;
  shortcut: string;
  children: ReactNode;
};

function ShortcutTooltip({ label, shortcut, children }: ShortcutTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="flex items-center gap-1.5 rounded border border-border/30 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground/80 shadow-none backdrop-blur-sm zoom-in-100 data-[state=closed]:zoom-out-100"
      >
        <span>{label}</span>
        <kbd className="rounded border border-border/30 bg-muted/40 px-1 py-0 font-mono text-[10px] text-muted-foreground/70">
          {shortcut}
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}

type Props = {
  onRequestFinish: (startedAt: Date, endedAt: Date) => void;
  finishOpen?: boolean;
  resetKey?: number;
};

export function Stopwatch({ onRequestFinish, finishOpen = false, resetKey = 0 }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [displayMs, setDisplayMs] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.status !== "running") {
      setDisplayMs(computeMs(state, performance.now()));
      return;
    }
    const tick = () => {
      setDisplayMs(computeMs(state, performance.now()));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  const onStart = () =>
    dispatch({ type: "START", now: performance.now(), wall: Date.now() });
  const onPause = () => dispatch({ type: "PAUSE", now: performance.now() });
  const onResume = () => dispatch({ type: "RESUME", now: performance.now() });
  const onReset = () => dispatch({ type: "RESET" });
  const onFinish = () => {
    if (finishOpen) return;
    const now = performance.now();
    const finalMs = computeMs(state, now);
    if (finalMs <= 0 || state.startedAtWall === null) {
      dispatch({ type: "RESET" });
      return;
    }
    const startedAt = new Date(state.startedAtWall);
    const endedAt = new Date(state.startedAtWall + finalMs);
    onRequestFinish(startedAt, endedAt);
  };

  // External reset (after dialog save/cancel) handled by parent via key change is overkill;
  // instead we expose a useEffect: when finishOpen turns from true -> false, reset.
  const prevFinishOpenRef = useRef(finishOpen);
  useEffect(() => {
    if (prevFinishOpenRef.current && !finishOpen) {
      dispatch({ type: "RESET" });
    }
    prevFinishOpenRef.current = finishOpen;
  }, [finishOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (finishOpen) return;
      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          if (state.status === "idle") onStart();
          else if (state.status === "running") onPause();
          else if (state.status === "paused") onResume();
          break;
        case "n":
        case "N":
          if (state.status === "running" || state.status === "paused") onReset();
          break;
        case "a":
        case "A":
          if (state.status === "running" || state.status === "paused") onFinish();
          break;
        case "Escape":
          if (state.status === "running" || state.status === "paused") onReset();
          break;
      }
    },
    [state.status, finishOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section
      aria-labelledby="stopur-overskrift"
      className="flex w-full flex-col items-center justify-center gap-12 px-6 py-12"
    >
      <h1 id="stopur-overskrift" className="sr-only">
        Stopur
      </h1>

      <TimeDisplay ms={displayMs} />

      <TooltipProvider delayDuration={1000}>
        <div
          role="group"
          aria-label="Stopur-kontroller"
          className="flex flex-wrap items-center justify-center gap-6"
        >
          {state.status === "idle" && (
            <ShortcutTooltip label="Start" shortcut="Mellemrum">
              <button
                type="button"
                onClick={onStart}
                className={startBtn}
                aria-keyshortcuts=" "
              >
                <Play className="h-7 w-7" aria-hidden="true" />
                Start
              </button>
            </ShortcutTooltip>
          )}

          {state.status === "running" && (
            <>
              <ShortcutTooltip label="Nulstil" shortcut="N">
                <button
                  type="button"
                  onClick={onReset}
                  className={resetBtn}
                  aria-keyshortcuts="N"
                >
                  <RotateCcw className="h-7 w-7" aria-hidden="true" />
                  Nulstil
                </button>
              </ShortcutTooltip>
              <ShortcutTooltip label="Afslut" shortcut="A">
                <button
                  type="button"
                  onClick={onFinish}
                  className={finishBtn}
                  aria-keyshortcuts="A"
                >
                  <Square className="h-7 w-7" aria-hidden="true" />
                  Afslut
                </button>
              </ShortcutTooltip>
              <ShortcutTooltip label="Pause" shortcut="Mellemrum">
                <button
                  type="button"
                  onClick={onPause}
                  className={pauseBtn}
                  aria-keyshortcuts=" "
                >
                  <Pause className="h-7 w-7" aria-hidden="true" />
                  Pause
                </button>
              </ShortcutTooltip>
            </>
          )}

          {state.status === "paused" && (
            <>
              <ShortcutTooltip label="Nulstil" shortcut="N">
                <button
                  type="button"
                  onClick={onReset}
                  className={resetBtn}
                  aria-keyshortcuts="N"
                >
                  <RotateCcw className="h-7 w-7" aria-hidden="true" />
                  Nulstil
                </button>
              </ShortcutTooltip>
              <ShortcutTooltip label="Afslut" shortcut="A">
                <button
                  type="button"
                  onClick={onFinish}
                  className={finishBtn}
                  aria-keyshortcuts="A"
                >
                  <Square className="h-7 w-7" aria-hidden="true" />
                  Afslut
                </button>
              </ShortcutTooltip>
              <ShortcutTooltip label="Fortsæt" shortcut="Mellemrum">
                <button
                  type="button"
                  onClick={onResume}
                  className={resumeBtn}
                  aria-keyshortcuts=" "
                >
                  <FastForward className="h-7 w-7" aria-hidden="true" />
                  Fortsæt
                </button>
              </ShortcutTooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    </section>
  );
}
