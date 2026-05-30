import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Measurement } from "@/hooks/use-measurements";
import { MeasurementsList } from "@/components/measurements/MeasurementsList";
import { formatTotal, type SummaryFormat } from "@/components/oversigt/format";
import { cn } from "@/lib/utils";

type Props = {
  measurements: Measurement[];
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
};

const FORMAT_KEY = "precisely.summaryFormat";
const HISTORY_OPEN_KEY = "precisely.historyOpen";

export function MeasurementsTable({
  measurements,
  onUpdate,
  onDelete,
}: Props) {
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const [tipVisible, setTipVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [format, setFormat] = useState<SummaryFormat>("hm");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const f = window.localStorage.getItem(FORMAT_KEY);
      if (f === "decimal" || f === "hm") setFormat(f);
      const o = window.localStorage.getItem(HISTORY_OPEN_KEY);
      if (o === "0") setOpen(false);
      else if (o === "1") setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(HISTORY_OPEN_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  };

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

  const total = measurements.reduce((sum, m) => sum + m.ms, 0);

  return (
    <>
      <section
        aria-label="Seneste registreringer"
        className="flex h-full w-full flex-col"
      >
        <div className="scrollbar-purple mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-3 pt-2">
          {measurements.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <p className="py-6 text-center text-xs text-muted-foreground/80">
                Ingen registreringer endnu i dag.
              </p>
            </div>
          ) : (
            <Collapsible
              open={open}
              onOpenChange={handleOpenChange}
              className="rounded-lg border border-border bg-card"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-4 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-150",
                        open && "rotate-90",
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-foreground">Historik</span>
                  </span>
                  <span className="flex items-center gap-3 text-sm tabular-nums text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {formatTotal(total, format)}
                    </span>
                    <span className="text-xs">({measurements.length})</span>
                  </span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border px-2 pb-2">
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
              </CollapsibleContent>
            </Collapsible>
          )}
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
