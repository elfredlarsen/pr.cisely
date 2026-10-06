import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TimeDisplay } from "./TimeDisplay";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import { useStopwatch, LONG_RUN_MS } from "./StopwatchContext";
import { UndoToast } from "./UndoToast";

const baseBtn =
  "inline-flex h-14 min-w-0 flex-1 basis-0 items-center justify-center gap-2 rounded-xl px-3 text-base font-semibold text-timer-foreground shadow-glass ring-offset-background transition-all duration-150 hover:brightness-110 active:scale-[0.97] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:text-lg";

const startBtn = `${baseBtn} bg-timer-start`;
const finishBtn = `${baseBtn} bg-timer-finish`;
const pauseBtn = `${baseBtn} bg-timer-pause`;
const resetBtn =
  "inline-flex h-14 min-w-0 flex-1 basis-0 items-center justify-center gap-2 rounded-xl border border-border/70 bg-secondary/80 px-3 text-base font-medium text-secondary-foreground shadow-card backdrop-blur-sm transition-all duration-150 hover:bg-accent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30 sm:text-lg";
const resumeBtn = startBtn;

const UNDO_TOAST_ID = "stopwatch-reset-undo";

type Props = {
  onRequestFinish: (startedAt: Date, endedAt: Date) => void;
  finishOpen?: boolean;
};

export function Stopwatch({ onRequestFinish, finishOpen = false }: Props) {
  const { status, displayMs, start, pause, resume, reset, restore, getFinishPayload } =
    useStopwatch();
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

  const [announcement, setAnnouncement] = useState("");
  const announce = (msg: string) => {
    // Clear first so repeating the same message is announced again.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(msg), 50);
  };
  const spokenTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const parts: string[] = [];
    if (h) parts.push(`${h} ${h === 1 ? "time" : "timer"}`);
    if (m) parts.push(`${m} ${m === 1 ? "minut" : "minutter"}`);
    if (s || parts.length === 0) parts.push(`${s} ${s === 1 ? "sekund" : "sekunder"}`);
    return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} og ${parts[parts.length - 1]}` : parts[0];
  };

  const onStart = () => {
    toast.dismiss(UNDO_TOAST_ID);
    start();
    announce("Stopur startet");
  };
  const onPause = () => {
    pause();
    announce(`Stopur sat på pause ved ${spokenTime(displayMs)}`);
  };
  const onResume = () => {
    resume();
    announce("Stopur genoptaget");
  };
  const onReset = () => {
    const snapshot = reset();
    announce("Stopur nulstillet");
    toast.custom(
      (t) => (
        <UndoToast
          id={t}
          onUndo={() => {
            restore(snapshot);
            announce("Nulstilling fortrudt");
          }}
        />
      ),
      { id: UNDO_TOAST_ID, duration: Infinity },
    );
  };
  const onFinish = () => {
    if (finishOpen) return;
    const payload = getFinishPayload();
    if (!payload) {
      reset();
      return;
    }
    onRequestFinish(payload.startedAt, payload.endedAt);
  };

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
          if (status === "idle") onStart();
          else if (status === "running") onPause();
          else if (status === "paused") onResume();
          break;
        case "n":
        case "N":
          if (status === "running" || status === "paused") onReset();
          break;
        case "a":
        case "A":
          if (status === "running" || status === "paused") onFinish();
          break;
      }
    },
    [status, finishOpen, onStart, onPause, onResume, onReset, onFinish],
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
          <TimeDisplay ms={displayMs} running={status === "running"} paused={status === "paused"} />
        </div>

        {status === "running" && displayMs >= LONG_RUN_MS && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-warning bg-warning/15 px-4 py-2 text-sm text-foreground"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Stopuret har kørt i over 3 timer. Har du glemt at stoppe det?
          </div>
        )}


        <div
          role="group"
          aria-label="Stopur-kontroller"
          style={clockWidth ? { width: clockWidth, maxWidth: "100%" } : undefined}
          className="flex w-full flex-nowrap items-center gap-2.5"
        >
          <IconTooltip label="Nulstil" shortcut="N">
            <button type="button" onClick={onReset} disabled={status === "idle"} className={resetBtn} aria-keyshortcuts="N">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Nulstil
            </button>
          </IconTooltip>
          <IconTooltip label="Afslut" shortcut="A">
            <button type="button" onClick={onFinish} disabled={status === "idle"} className={finishBtn} aria-keyshortcuts="A">
              <Check className="h-5 w-5" aria-hidden="true" />
              Afslut
            </button>
          </IconTooltip>
          {status === "idle" && (
          <IconTooltip label="Start" shortcut="Mellemrum">
            <button type="button" onClick={onStart} className={startBtn} aria-keyshortcuts=" ">
              <Play className="h-5 w-5" aria-hidden="true" />
              Start
            </button>
          </IconTooltip>
          )}
          {status === "running" && (
          <IconTooltip label="Pause" shortcut="Mellemrum">
            <button type="button" onClick={onPause} className={pauseBtn} aria-keyshortcuts=" ">
              <Pause className="h-5 w-5" aria-hidden="true" />
              Pause
            </button>
          </IconTooltip>
          )}
          {status === "paused" && (
          <IconTooltip label="Fortsæt" shortcut="Mellemrum">
            <button type="button" onClick={onResume} className={resumeBtn} aria-keyshortcuts=" ">
              <Play className="h-5 w-5" aria-hidden="true" />
              Fortsæt
            </button>
          </IconTooltip>
          )}
        </div>
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </section>
  );
}
