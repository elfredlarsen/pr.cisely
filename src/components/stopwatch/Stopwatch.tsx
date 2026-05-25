import { useEffect, useReducer, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Square, FastForward } from "lucide-react";
import { TimeDisplay } from "./TimeDisplay";

type Status = "idle" | "running" | "paused";

type State = {
  status: Status;
  elapsed: number;
  startedAt: number | null;
};

type Action =
  | { type: "START"; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "RESET" };

const initialState: State = { status: "idle", elapsed: 0, startedAt: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { status: "running", elapsed: 0, startedAt: action.now };
    case "PAUSE":
      if (state.status !== "running" || state.startedAt === null) return state;
      return {
        status: "paused",
        elapsed: state.elapsed + (action.now - state.startedAt),
        startedAt: null,
      };
    case "RESUME":
      if (state.status !== "paused") return state;
      return { status: "running", elapsed: state.elapsed, startedAt: action.now };
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
  "inline-flex min-h-14 items-center justify-center gap-3 rounded-lg px-10 py-3 text-xl font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const startBtn = `${baseBtn} bg-success text-success-foreground hover:bg-success/90`;
const finishBtn = `${baseBtn} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
const pauseBtn = `${baseBtn} bg-warning text-warning-foreground hover:bg-warning/90`;
const resetBtn = `${baseBtn} bg-info text-info-foreground hover:bg-info/90`;
const resumeBtn = `${baseBtn} bg-[--brand-primary] text-white hover:opacity-90`;

type Props = {
  onSaveMeasurement: (ms: number) => void;
};

export function Stopwatch({ onSaveMeasurement }: Props) {
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

  const onStart = () => dispatch({ type: "START", now: performance.now() });
  const onPause = () => dispatch({ type: "PAUSE", now: performance.now() });
  const onResume = () => dispatch({ type: "RESUME", now: performance.now() });
  const onReset = () => dispatch({ type: "RESET" });
  const onFinish = () => {
    const now = performance.now();
    const finalMs = computeMs(state, now);
    if (finalMs > 0) onSaveMeasurement(finalMs);
    dispatch({ type: "RESET" });
  };

  return (
    <section
      aria-labelledby="stopur-overskrift"
      className="flex w-full flex-col items-center justify-center gap-12 px-6 py-16"
    >
      <h1 id="stopur-overskrift" className="sr-only">
        Stopur
      </h1>

      <TimeDisplay ms={displayMs} />

      <div
        role="group"
        aria-label="Stopur-kontroller"
        className="flex flex-wrap items-center justify-center gap-6"
      >
        {state.status === "idle" && (
          <button type="button" onClick={onStart} className={startBtn}>
            <Play className="h-7 w-7" aria-hidden="true" />
            Start
          </button>
        )}

        {state.status === "running" && (
          <>
            <button type="button" onClick={onReset} className={resetBtn}>
              <RotateCcw className="h-7 w-7" aria-hidden="true" />
              Nulstil
            </button>
            <button type="button" onClick={onFinish} className={finishBtn}>
              <Square className="h-7 w-7" aria-hidden="true" />
              Afslut
            </button>
            <button type="button" onClick={onPause} className={pauseBtn}>
              <Pause className="h-7 w-7" aria-hidden="true" />
              Pause
            </button>
          </>
        )}

        {state.status === "paused" && (
          <>
            <button type="button" onClick={onReset} className={resetBtn}>
              <RotateCcw className="h-7 w-7" aria-hidden="true" />
              Nulstil
            </button>
            <button type="button" onClick={onFinish} className={finishBtn}>
              <Square className="h-7 w-7" aria-hidden="true" />
              Afslut
            </button>
            <button type="button" onClick={onResume} className={resumeBtn}>
              <FastForward className="h-7 w-7" aria-hidden="true" />
              Fortsæt
            </button>
          </>
        )}
      </div>
    </section>
  );
}
