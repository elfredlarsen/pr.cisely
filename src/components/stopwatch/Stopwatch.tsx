import { useEffect, useReducer, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Square, FastForward } from "lucide-react";
import { TimeDisplay } from "./TimeDisplay";
import { IconTooltip } from "@/components/ui/icon-tooltip";

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
  "inline-flex h-14 min-w-0 flex-1 basis-0 items-center justify-center gap-2.5 rounded-lg px-5 py-2.5 text-xl font-semibold shadow-sm ring-offset-2 ring-offset-background transition-all duration-150 hover:shadow-md hover:brightness-110 active:scale-[0.98] active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed";

const startBtn = `${baseBtn} bg-[#0e7d35] text-white`;
const finishBtn = `${baseBtn} bg-[#dc2626] text-white`;
const pauseBtn = `${baseBtn} bg-[#db2777] text-white`;
const resetBtn = `${baseBtn} bg-[#2563eb] text-white`;
const resumeBtn = `${baseBtn} bg-[#0e7d35] text-white`;

type Props = {
  onRequestFinish: (startedAt: Date, endedAt: Date) => void;
  finishOpen?: boolean;
  resetKey?: number;
};

export function Stopwatch({ onRequestFinish, finishOpen = false, resetKey = 0 }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [displayMs, setDisplayMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const clockRef = useRef<HTMLDivElement | null>(null);
  const [clockWidth, setClockWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!clockRef.current) return;
    const el = clockRef.current;
    const update = () => {
      const inner = el.firstElementChild as HTMLElement | null;
      setClockWidth(inner ? inner.getBoundingClientRect().width : el.getBoundingClientRect().width);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Reset only when parent explicitly signals (e.g. after save), not on cancel.
  const prevResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      dispatch({ type: "RESET" });
      prevResetKeyRef.current = resetKey;
    }
  }, [resetKey]);

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
      aria-hidden={finishOpen || undefined}
      className={`flex w-full flex-col items-center justify-center py-8 ${finishOpen ? "pointer-events-none" : ""}`}
    >
      <h1 id="stopur-overskrift" className="sr-only">
        Stopur
      </h1>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4">
        <div
          ref={clockRef}
          className={`flex w-full justify-center transition-opacity duration-200 ${finishOpen ? "opacity-[0.03]" : "opacity-100"}`}
        >
          <TimeDisplay ms={displayMs} />
        </div>

        
          <div
            role="group"
            aria-label="Stopur-kontroller"
            style={clockWidth ? { width: clockWidth, maxWidth: "100%" } : undefined}
            className={`flex flex-wrap items-center gap-3 ${state.status === "idle" ? "justify-center" : "justify-between"}`}
          >
            {state.status === "idle" && (
              <IconTooltip label="Start" shortcut="Mellemrum">
                <button
                  type="button"
                  onClick={onStart}
                  className={`${startBtn} max-w-56`}
                  aria-keyshortcuts=" "
                >
                  <Play className="h-7 w-7" aria-hidden="true" />
                  Start
                </button>
              </IconTooltip>
            )}

            {state.status === "running" && (
              <>
                <IconTooltip label="Nulstil" shortcut="N">
                  <button
                    type="button"
                    onClick={onReset}
                    className={resetBtn}
                    aria-keyshortcuts="N"
                  >
                    <RotateCcw className="h-7 w-7" aria-hidden="true" />
                    Nulstil
                  </button>
                </IconTooltip>
                <IconTooltip label="Afslut" shortcut="A">
                  <button
                    type="button"
                    onClick={onFinish}
                    className={finishBtn}
                    aria-keyshortcuts="A"
                  >
                    <Square className="h-7 w-7" aria-hidden="true" />
                    Afslut
                  </button>
                </IconTooltip>
                <IconTooltip label="Pause" shortcut="Mellemrum">
                  <button
                    type="button"
                    onClick={onPause}
                    className={pauseBtn}
                    aria-keyshortcuts=" "
                  >
                    <Pause className="h-7 w-7" aria-hidden="true" />
                    Pause
                  </button>
                </IconTooltip>
              </>
            )}

            {state.status === "paused" && (
              <>
                <IconTooltip label="Nulstil" shortcut="N">
                  <button
                    type="button"
                    onClick={onReset}
                    className={resetBtn}
                    aria-keyshortcuts="N"
                  >
                    <RotateCcw className="h-7 w-7" aria-hidden="true" />
                    Nulstil
                  </button>
                </IconTooltip>
                <IconTooltip label="Afslut" shortcut="A">
                  <button
                    type="button"
                    onClick={onFinish}
                    className={finishBtn}
                    aria-keyshortcuts="A"
                  >
                    <Square className="h-7 w-7" aria-hidden="true" />
                    Afslut
                  </button>
                </IconTooltip>
                <IconTooltip label="Fortsæt" shortcut="Mellemrum">
                  <button
                    type="button"
                    onClick={onResume}
                    className={resumeBtn}
                    aria-keyshortcuts=" "
                  >
                    <FastForward className="h-7 w-7" aria-hidden="true" />
                    Fortsæt
                  </button>
                </IconTooltip>
              </>
            )}
          </div>
        
      </div>
    </section>
  );
}
