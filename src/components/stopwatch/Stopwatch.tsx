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

const primaryBtn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const secondaryBtn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
        className="flex flex-wrap items-center justify-center gap-4"
      >
        {state.status === "idle" && (
          <button
            type="button"
            onClick={onStart}
            className={primaryBtn}
            style={{ background: "var(--brand-gradient)" }}
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            Start
          </button>
        )}

        {state.status === "running" && (
          <>
            <button type="button" onClick={onReset} className={secondaryBtn}>
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Nulstil
            </button>
            <button type="button" onClick={onPause} className={secondaryBtn}>
              <Pause className="h-5 w-5" aria-hidden="true" />
              Pause
            </button>
            <button
              type="button"
              onClick={onFinish}
              className={primaryBtn}
              style={{ background: "var(--brand-gradient)" }}
            >
              <Square className="h-5 w-5" aria-hidden="true" />
              Afslut
            </button>
          </>
        )}

        {state.status === "paused" && (
          <>
            <button type="button" onClick={onReset} className={secondaryBtn}>
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Nulstil
            </button>
            <button type="button" onClick={onFinish} className={secondaryBtn}>
              <Square className="h-5 w-5" aria-hidden="true" />
              Afslut
            </button>
            <button
              type="button"
              onClick={onResume}
              className={primaryBtn}
              style={{ background: "var(--brand-gradient)" }}
            >
              <FastForward className="h-5 w-5" aria-hidden="true" />
              Fortsæt
            </button>
          </>
        )}
      </div>
    </section>
  );
}
