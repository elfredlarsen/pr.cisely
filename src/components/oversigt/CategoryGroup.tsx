import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  fmtDuration,
  fmtTime,
  formatTotal,
  maskDuration,
  parseDuration,
  parseTime,
  type SummaryFormat,
} from "./format";
import { cn } from "@/lib/utils";

type Props = {
  category: Category;
  items: Measurement[];
  format: SummaryFormat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
};

type EditingCell = { id: string; field: "start" | "end" | "duration" } | null;
type SortField = "start" | "end" | "duration";
type SortDir = "asc" | "desc";

export function CategoryGroup({
  category,
  items,
  format,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: Props) {
  const total = items.reduce((sum, m) => sum + m.ms, 0);

  const [editing, setEditing] = useState<EditingCell>(null);
  const [draft, setDraft] = useState("");
  const [pendingCategoryChange, setPendingCategoryChange] = useState<
    { id: string; from: Category; to: Category } | null
  >(null);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
    field: "start",
    dir: "asc",
  });

  const sortedItems = useMemo(() => {
    const getKey = (m: Measurement) => {
      if (sort.field === "start") return new Date(m.startedAt).getTime();
      if (sort.field === "end") return new Date(m.endedAt).getTime();
      return m.ms;
    };
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => (getKey(a) - getKey(b)) * sign);
  }, [items, sort]);

  const toggleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
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
          className="h-8 w-24 rounded border border-input bg-background px-2 text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, field)}
        className="group inline-flex h-8 w-24 items-center justify-start gap-1.5 rounded px-1 py-0.5 tabular-nums text-muted-foreground transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span>{value}</span>
        <Pencil
          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
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
          className="h-8 w-24 rounded border border-input bg-background px-2 text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <Pencil
          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </button>
    );
  };

  const renderSortHeader = (field: SortField, label: string) => {
    const active = sort.field === field;
    const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        aria-sort={ariaSort}
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded px-1 text-[11px] font-normal uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "text-foreground" : "text-muted-foreground/70",
        )}
      >
        <span>{label}</span>
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-3 w-3" aria-hidden="true" />
          )
        ) : (
          <ArrowUp className="h-3 w-3 opacity-0" aria-hidden="true" />
        )}
      </button>
    );
  };

  const pendingFromLabel = pendingCategoryChange
    ? categoryLabel(pendingCategoryChange.from)
    : "";
  const pendingToLabel = pendingCategoryChange
    ? categoryLabel(pendingCategoryChange.to)
    : "";

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
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
            <span className="text-sm font-medium text-foreground">
              {categoryLabel(category)}
            </span>
          </span>
          <span className="flex items-center gap-3 text-sm tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatTotal(total, format)}
            </span>
            <span className="text-xs">({items.length})</span>
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border px-2 pb-2">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="h-8 w-24 py-1">
                  {renderSortHeader("start", "Start")}
                </TableHead>
                <TableHead className="h-8 w-24 py-1">
                  {renderSortHeader("end", "Slut")}
                </TableHead>
                <TableHead className="h-8 w-24 py-1">
                  {renderSortHeader("duration", "Varighed")}
                </TableHead>
                <TableHead className="h-8 w-auto py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
                  Kategori
                </TableHead>
                <TableHead className="h-8 w-16 py-1 text-right text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
                  <span className="sr-only">Handlinger</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((m) => {
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
                    <TableCell className="py-1 text-xs">
                      {renderTimeCell(m, "start")}
                    </TableCell>
                    <TableCell className="py-1 text-xs">
                      {renderTimeCell(m, "end")}
                    </TableCell>
                    <TableCell className="py-1 text-xs">
                      {renderDurationCell(m)}
                    </TableCell>
                    <TableCell className="py-1 text-xs">
                      <Select
                        value={m.category}
                        onValueChange={(v) => {
                          const next = v as Category;
                          if (next !== m.category) {
                            setPendingCategoryChange({
                              id: m.id,
                              from: m.category,
                              to: next,
                            });
                          }
                        }}
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-[#c471ed]/25 hover:text-destructive"
                            aria-label="Slet registrering"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Slet registrering?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Registreringen slettes permanent og kan ikke gendannes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuller</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(m.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Slet
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>

      <AlertDialog
        open={pendingCategoryChange !== null}
        onOpenChange={(o) => {
          if (!o) setPendingCategoryChange(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skift kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Fra <strong>{pendingFromLabel}</strong> til <strong>{pendingToLabel}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingCategoryChange) {
                  onUpdate(pendingCategoryChange.id, {
                    category: pendingCategoryChange.to,
                  });
                }
                setPendingCategoryChange(null);
              }}
            >
              Skift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Collapsible>
  );
}
