import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Measurement } from "@/hooks/use-measurements";
import { MeasurementsList } from "@/components/measurements/MeasurementsList";

type Props = {
  measurements: Measurement[];
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
};

export function MeasurementsTable({
  measurements,
  onUpdate,
  onDelete,
  onDeleteAll,
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

  const clearHistoryButton = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-9 whitespace-nowrap px-2 text-xs font-normal text-muted-foreground hover:bg-[#c471ed]/25 hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Ryd historik
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Slet alle dagens registreringer?</AlertDialogTitle>
          <AlertDialogDescription>
            Registreringerne slettes permanent og kan ikke gendannes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuller</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onDeleteAll();
              toast.success("Historik slettet");
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Slet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

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
                <div className="flex justify-end px-1 pt-1">
                  {clearHistoryButton}
                </div>
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
