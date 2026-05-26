import { useState } from "react";
import { EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CATEGORIES, categoryLabel, type Category } from "@/lib/categories";
import type { Measurement } from "@/hooks/use-measurements";

type Props = {
  measurements: Measurement[];
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onHideAll: () => void;
};

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fmtDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function parseTime(value: string, base: Date): Date | null {
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  const d = new Date(base);
  d.setHours(h, mi, s, 0);
  return d;
}

function parseDuration(value: string): number | null {
  const m = value.match(/^(\d{1,3}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = Number(m[3]);
  if (mi > 59 || s > 59) return null;
  return (h * 3600 + mi * 60 + s) * 1000;
}

type EditingCell = { id: string; field: "start" | "end" | "duration" } | null;

export function MeasurementsTable({
  measurements,
  onUpdate,
  onHide,
  onUnhide,
  onHideAll,
}: Props) {
  const [editing, setEditing] = useState<EditingCell>(null);
  const [draft, setDraft] = useState("");

  const beginEdit = (m: Measurement, field: NonNullable<EditingCell>["field"]) => {
    setEditing({ id: m.id, field });
    if (field === "start") setDraft(fmtTime(m.startedAt));
    else if (field === "end") setDraft(fmtTime(m.endedAt));
    else setDraft(fmtDuration(m.ms));
  };

  const commit = (m: Measurement) => {
    if (!editing) return;
    if (editing.field === "start") {
      const newStart = parseTime(draft, new Date(m.startedAt));
      if (newStart) {
        const endMs = new Date(m.endedAt).getTime();
        const newMs = Math.max(0, endMs - newStart.getTime());
        onUpdate(m.id, { startedAt: newStart.toISOString(), ms: newMs });
      }
    } else if (editing.field === "end") {
      const newEnd = parseTime(draft, new Date(m.endedAt));
      if (newEnd) {
        const startMs = new Date(m.startedAt).getTime();
        const newMs = Math.max(0, newEnd.getTime() - startMs);
        onUpdate(m.id, { endedAt: newEnd.toISOString(), ms: newMs });
      }
    } else {
      const newMs = parseDuration(draft);
      if (newMs !== null && newMs > 0) {
        const newEnd = new Date(new Date(m.startedAt).getTime() + newMs);
        onUpdate(m.id, { ms: newMs, endedAt: newEnd.toISOString() });
      }
    }
    setEditing(null);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, m: Measurement) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(m);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditing(null);
    }
  };

  const isEditing = (m: Measurement, field: NonNullable<EditingCell>["field"]) =>
    editing?.id === m.id && editing.field === field;

  const renderTimeCell = (m: Measurement, field: "start" | "end") => {
    const value = field === "start" ? fmtTime(m.startedAt) : fmtTime(m.endedAt);
    if (isEditing(m, field)) {
      return (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(m)}
          onKeyDown={(e) => handleKey(e, m)}
          className="h-8 w-24 rounded border border-input bg-background px-2 font-mono text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, field)}
        className="rounded px-1 py-0.5 font-mono tabular-nums hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {value}
      </button>
    );
  };

  const renderDurationCell = (m: Measurement) => {
    if (isEditing(m, "duration")) {
      return (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(m)}
          onKeyDown={(e) => handleKey(e, m)}
          className="h-8 w-24 rounded border border-input bg-background px-2 font-mono text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, "duration")}
        className="rounded px-1 py-0.5 font-mono tabular-nums hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {fmtDuration(m.ms)}
      </button>
    );
  };

  return (
    <section
      aria-labelledby="historik-overskrift"
      className="flex h-full w-full flex-col"
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pb-2 pt-4">
        <h2
          id="historik-overskrift"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Dagens registreringer
        </h2>
        {measurements.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Ryd historik
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Skjul alle dagens registreringer?</AlertDialogTitle>
                <AlertDialogDescription>
                  Registreringerne fjernes fra listen, men gemmes i arkivet.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuller</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onHideAll();
                    toast.success("Historik skjult", {
                      description: "Registreringerne findes i arkivet.",
                    });
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Skjul
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-6 pb-6">
        {measurements.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ingen registreringer endnu i dag.
          </p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-24">Start</TableHead>
                <TableHead className="w-24">Slut</TableHead>
                <TableHead className="w-24">Varighed</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="w-12 text-right" aria-label="Handlinger" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{renderTimeCell(m, "start")}</TableCell>
                  <TableCell>{renderTimeCell(m, "end")}</TableCell>
                  <TableCell>{renderDurationCell(m)}</TableCell>
                  <TableCell>
                    <Select
                      value={m.category}
                      onValueChange={(v) => onUpdate(m.id, { category: v as Category })}
                    >
                      <SelectTrigger
                        className="h-8 w-full border-transparent bg-transparent hover:border-input"
                        aria-label={`Kategori for registrering, nu ${categoryLabel(m.category)}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onHide(m.id);
                        toast("Skjult — findes i arkivet", {
                          action: {
                            label: "Fortryd",
                            onClick: () => onUnhide(m.id),
                          },
                        });
                      }}
                      aria-label="Skjul registrering"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
