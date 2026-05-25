import { Trash2 } from "lucide-react";
import type { Measurement } from "@/hooks/use-measurements";
import { formatTime } from "./TimeDisplay";
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

type Props = {
  measurements: Measurement[];
  onClear: () => void;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "lige nu";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `for ${min} min siden`;
  const h = Math.round(min / 60);
  if (h < 24) return `for ${h} t siden`;
  const d = Math.round(h / 24);
  return `for ${d} d siden`;
}

export function MeasurementsList({ measurements, onClear }: Props) {
  if (measurements.length === 0) return null;
  const visible = measurements.slice(0, 5);

  return (
    <section
      aria-labelledby="senestemaalinger-overskrift"
      className="w-full max-w-md px-6"
    >
      <h2
        id="senestemaalinger-overskrift"
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Seneste målinger
      </h2>
      <ol aria-live="polite" className="space-y-1.5">
        {visible.map((m) => {
          const { main, hundredths } = formatTime(m.ms);
          return (
            <li
              key={m.id}
              className="flex items-baseline justify-between rounded-md border border-border bg-card px-3 py-2"
            >
              <span className="font-mono tabular-nums text-base text-foreground">
                {main}
                <span className="text-sm text-muted-foreground">:{hundredths}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {relativeTime(m.endedAt)}
              </span>
            </li>
          );
        })}
      </ol>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Ryd historik
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet alle målinger?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handling kan ikke fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
