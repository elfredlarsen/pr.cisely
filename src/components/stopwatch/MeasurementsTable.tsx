import { useEffect, useState } from "react";
import { ChevronRight, Timer } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import type { Measurement } from "@/hooks/use-measurements";
import { MeasurementsList } from "@/components/measurements/MeasurementsList";
import { formatTotal, type SummaryFormat } from "@/components/oversigt/format";
import { cn } from "@/lib/utils";

type Props = {
  measurements: Measurement[];
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
  loaded?: boolean;
};

const FORMAT_KEY = "precisely.summaryFormat";
const HISTORY_OPEN_KEY = "precisely.historyOpen";

export function MeasurementsTable({
  measurements,
  onUpdate,
  onDelete,
  loaded = true,
}: Props) {
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

  const total = measurements.reduce((sum, m) => sum + m.ms, 0);

  return (
    <section
      aria-label="Seneste registreringer"
      className="flex h-full w-full min-h-0 flex-col"
    >
      <div className="mx-auto flex h-full w-full min-h-0 max-w-3xl flex-col px-4 pb-3 pt-2">
        {!loaded ? (
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-11/12" />
              <Skeleton className="h-7 w-10/12" />
            </div>
          </div>
        ) : measurements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-6 py-10 text-center">
            <Timer className="h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Ingen registreringer endnu i dag
            </p>
            <p className="text-xs text-muted-foreground">
              Start stopuret ovenfor for at registrere din første tid
            </p>
          </div>
        ) : (
          <Collapsible
            open={open}
            onOpenChange={handleOpenChange}
            className="flex flex-col rounded-lg border border-border bg-card"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex min-h-11 w-full shrink-0 items-center justify-between gap-3 rounded-lg px-4 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  <span className="text-xs tabular-nums text-muted-foreground">
                    ({measurements.length})
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {formatTotal(total, format)}
                  </span>
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="scrollbar-purple max-h-80 overflow-y-auto border-t border-border px-2 pb-2">
                <MeasurementsList
                  items={measurements}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  stickyHeader
                  sortable={false}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </section>
  );
}
