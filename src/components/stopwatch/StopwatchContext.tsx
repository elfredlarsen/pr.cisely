import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";

type Status = "idle" | "running" | "paused";

type State = {
  status: Status;
  elapsed: number;
  startedAt: number | null; // performance.now timestamp
  startedAtWall: number | null; // Date.now when first started
};

export type StopwatchSnapshot = State;

type Action =
  | { type: "START"; now: number; wall: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "RESET" }
  | { type: "RESTORE"; snapshot: State };

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
    case "RESTORE":
      // Only restore onto an idle stopwatch so a new timing is never overwritten.
      if (state.status !== "idle") return state;
      return action.snapshot;
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

type StopwatchContextValue = {
  status: Status;
  displayMs: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => StopwatchSnapshot;
  restore: (snapshot: StopwatchSnapshot) => void;
  getFinishPayload: () => { startedAt: Date; endedAt: Date } | null;
};

const StopwatchContext = createContext<StopwatchContextValue | null>(null);

export function StopwatchProvider({ children }: { children: ReactNode }) {
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

  // Løbende tid i browserfanen (opdateres kun når sekundet skifter).
  const shownSec = Math.floor(displayMs / 1000);
  const baseTitleRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.status === "idle") {
      if (baseTitleRef.current !== null) {
        document.title = baseTitleRef.current;
        baseTitleRef.current = null;
      }
      return;
    }
    if (baseTitleRef.current === null) baseTitleRef.current = document.title;
    const p = (n: number) => String(n).padStart(2, "0");
    const t = `${p(Math.floor(shownSec / 3600))}:${p(Math.floor((shownSec % 3600) / 60))}:${p(shownSec % 60)}`;
    document.title = `${state.status === "running" ? "▶" : "⏸"} ${t} · pr:cisely`;
  }, [state.status, shownSec]);

  useEffect(
    () => () => {
      if (baseTitleRef.current !== null) document.title = baseTitleRef.current;
    },
    [],
  );

  const value: StopwatchContextValue = {
    status: state.status,
    displayMs,
    start: () => dispatch({ type: "START", now: performance.now(), wall: Date.now() }),
    pause: () => dispatch({ type: "PAUSE", now: performance.now() }),
    resume: () => dispatch({ type: "RESUME", now: performance.now() }),
    reset: () => {
      const snapshot = state;
      dispatch({ type: "RESET" });
      return snapshot;
    },
    restore: (snapshot) => dispatch({ type: "RESTORE", snapshot }),
    getFinishPayload: () => {
      const now = performance.now();
      const finalMs = computeMs(state, now);
      if (finalMs <= 0 || state.startedAtWall === null) return null;
      return {
        startedAt: new Date(state.startedAtWall),
        endedAt: new Date(state.startedAtWall + finalMs),
      };
    },
  };

  return <StopwatchContext.Provider value={value}>{children}</StopwatchContext.Provider>;
}

export function useStopwatch() {
  const ctx = useContext(StopwatchContext);
  if (!ctx) throw new Error("useStopwatch must be used inside StopwatchProvider");
  return ctx;
}
