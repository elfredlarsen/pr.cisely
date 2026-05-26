import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { EyeOff, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
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

  const maskDuration = (input: string): string => {
    const digits = input.replace(/\D/g, "").slice(0, 7);
    if (digits.length === 0) return "";
    const h = digits.slice(0, Math.max(1, digits.length - 4));
    const rest = digits.slice(h.length);
    const m = rest.slice(0, 2);
    const s = rest.slice(2, 4);
    let result = h;
    if (rest.length > 0) result += ":" + m;
    if (rest.length > 2) result += ":" + s;
    return result;
  };

  const renderTimeCell = (m: Measurement, field: "start" | "end") => {
    const value = field === "start" ? fmtTime(m.startedAt) : fmtTime(m.endedAt);
    if (isEditing(m, field)) {
      return (
        <input
          autoFocus
          type="time"
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(m)}
          onKeyDown={(e) => handleKey(e, m)}
          aria-label={field === "start" ? "Starttidspunkt" : "Sluttidspunkt"}
          className="h-8 w-28 rounded border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, field)}
        className="group inline-flex h-8 w-28 items-center justify-start gap-1.5 rounded px-1 py-0.5 tabular-nums text-muted-foreground transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span>{value}</span>
        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </button>
    );
  };

  const renderDurationCell = (m: Measurement) => {
    if (isEditing(m, "duration")) {
      return (
        <input
          autoFocus
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(maskDuration(e.target.value))}
          onBlur={() => commit(m)}
          onKeyDown={(e) => handleKey(e, m)}
          placeholder="0:00:00"
          aria-label="Varighed (timer:minutter:sekunder)"
          className="h-8 w-24 rounded border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, "duration")}
        className="group inline-flex h-8 w-24 items-center justify-start gap-1.5 rounded px-1 py-0.5 tabular-nums text-muted-foreground transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span>{fmtDuration(m.ms)}</span>
        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </button>
    );
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
  );

  return (
    <>
      <section
        aria-label="Seneste registreringer"
        className="flex h-full w-full flex-col opacity-75"
      >
        <div className="scrollbar-purple mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-3 pt-2">
          {measurements.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground/80">
              Ingen registreringer endnu i dag.
            </p>
          ) : (
            <Table className="w-full table-fixed">
              <TableHeader className="sticky top-0 bg-background">
                <TableRow
                  className="border-border/50"
                  onMouseEnter={handleHeaderEnter}
                  onMouseMove={handleHeaderMove}
                  onMouseLeave={handleHeaderLeave}
                >
                  <TableHead className="h-8 w-28 py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">Start</TableHead>
                  <TableHead className="h-8 w-28 py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">Slut</TableHead>
                  <TableHead className="h-8 w-24 py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">Varighed</TableHead>
                  <TableHead className="h-8 w-auto py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">Kategori</TableHead>
                  <TableHead className="h-8 w-36 py-1 text-right">
                    <div className="flex justify-end">{clearHistoryButton}</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((m) => {
                  const rowEditing = editing?.id === m.id;
                  return (
                  <TableRow
                    key={m.id}
                    data-state={rowEditing ? "selected" : undefined}
                    className={
                      rowEditing
                        ? "border-border/40 bg-[#c471ed]/15 hover:bg-[#c471ed]/15 data-[state=selected]:bg-[#c471ed]/15"
                        : "border-border/40 hover:bg-[#c471ed]/10"
                    }
                  >

                    <TableCell className="py-1 text-xs">{renderTimeCell(m, "start")}</TableCell>
                    <TableCell className="py-1 text-xs">{renderTimeCell(m, "end")}</TableCell>
                    <TableCell className="py-1 text-xs">{renderDurationCell(m)}</TableCell>
                    <TableCell className="py-1 text-xs">
                      <Select
                        value={m.category}
                        onValueChange={(v) => onUpdate(m.id, { category: v as Category })}
                      >
                        <SelectTrigger
                          className="h-7 w-full min-w-0 border-transparent bg-transparent text-xs font-medium text-foreground/80 transition-colors hover:border-[#c471ed]/40 hover:bg-[#c471ed]/25 hover:text-foreground"
                          aria-label={`Kategori for registrering, nu ${categoryLabel(m.category)}`}
                        >
                          <SelectValue className="truncate" />
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
                    <TableCell className="py-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
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
                        className="h-11 w-11 text-muted-foreground hover:bg-[#c471ed]/25 hover:text-foreground"
                      >
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}

              </TableBody>
            </Table>
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
