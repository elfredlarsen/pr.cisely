import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { Measurement } from "@/hooks/use-measurements";
import { MeasurementsList } from "@/components/measurements/MeasurementsList";

type Props = {
  measurements: Measurement[];
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
};

export function MeasurementsTable({
  measurements,
  onUpdate,
  onDelete,
}: Props) {
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const [tipVisible, setTipVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimer = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };
  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const handleHeaderEnter = (e: ReactMouseEvent<HTMLElement>) => {
    clearHideTimer();
    setTipPos({ x: e.clientX, y: e.clientY });
    clearShowTimer();
    showTimerRef.current = setTimeout(() => setTipVisible(true), 1000);
  };
  const handleHeaderMove = (e: ReactMouseEvent<HTMLElement>) => {
    setTipPos({ x: e.clientX, y: e.clientY });
    if (tipVisible) {
      setTipVisible(false);
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => setTipPos(null), 200);
    }
  };
  const handleHeaderLeave = () => {
    clearShowTimer();
    setTipVisible(false);
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setTipPos(null), 200);
  };

  return (
    <>
      <section
        aria-label="Seneste registreringer"
        className="flex h-full w-full flex-col opacity-75"
      >
        <div className="scrollbar-purple mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-3 pt-2">
          <div className="rounded-lg border border-border/60 bg-card">
            {measurements.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground/80">
                Ingen registreringer endnu i dag.
              </p>
            ) : (
              <div className="px-2 pb-2">
                <MeasurementsList
                  items={measurements}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  stickyHeader
                  sortable={false}
                  headerRowProps={{
                    onMouseEnter: handleHeaderEnter,
                    onMouseMove: handleHeaderMove,
                    onMouseLeave: handleHeaderLeave,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      {tipPos && (
        <div
          role="tooltip"
          aria-hidden="true"
          style={{ left: tipPos.x + 14, top: tipPos.y + 14 }}
          className={`pointer-events-none fixed z-50 rounded border border-[#c471ed]/25 bg-[#c471ed]/10 px-2 py-0.5 text-[11px] text-muted-foreground/90 shadow-none backdrop-blur-sm transition-opacity duration-200 ${tipVisible ? "opacity-100" : "opacity-0"}`}
        >
          Seneste registreringer
        </div>
      )}
    </>
  );
}
