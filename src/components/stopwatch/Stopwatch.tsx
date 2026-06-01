import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Square, FastForward } from "lucide-react";
import { TimeDisplay } from "./TimeDisplay";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import { useStopwatch } from "./StopwatchContext";

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
};

export function Stopwatch({ onRequestFinish, finishOpen = false }: Props) {
  const { status, displayMs, start, pause, resume, reset, getFinishPayload } = useStopwatch();
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

  const onStart = start;
  const onPause = pause;
  const onResume = resume;
  const onReset = reset;
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
        case "Escape":
          if (status === "running" || status === "paused") onReset();
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
          <TimeDisplay ms={displayMs} />
        </div>

        
          <div
            role="group"
            aria-label="Stopur-kontroller"
            style={clockWidth ? { width: clockWidth, maxWidth: "100%" } : undefined}
            className={`flex flex-wrap items-center gap-3 ${status === "idle" ? "justify-center" : "justify-between"}`}
          >
            {status === "idle" && (
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

            {status === "running" && (
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

            {status === "paused" && (
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
