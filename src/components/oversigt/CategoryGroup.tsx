import React, { useMemo, useState } from "react";
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

type EditField = "start" | "end" | "duration";
type RowEdit = {
  id: string;
  field: EditField;
  start: string;
  end: string;
  duration: string;
  origStart: string;
  origEnd: string;
  origDuration: string;
};
type SortField = "start" | "end" | "duration";
type SortDir = "asc" | "desc";

function parseTimeToSec(value: string): number | null {
  if (value.trim() === "") return 0;
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  return h * 3600 + mi * 60 + s;
}

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

function secToTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

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

  const [rowEdit, setRowEdit] = useState<RowEdit | null>(null);
  const [commentEdit, setCommentEdit] = useState<{ id: string; value: string } | null>(null);
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

  const beginEdit = (m: Measurement, field: EditField) => {
    const start = fmtTime(m.startedAt);
    const end = fmtTime(m.endedAt);
    const duration = fmtDuration(m.ms);
    setRowEdit({
      id: m.id,
      field,
      start,
      end,
      duration,
      origStart: start,
      origEnd: end,
      origDuration: duration,
    });
  };

  const cancelEdit = () => setRowEdit(null);

  const handleChangeStart = (v: string) => {
    setRowEdit((prev) => {
      if (!prev) return prev;
      const startSec = parseTimeToSec(v);
      const endSec = parseTimeToSec(prev.end);
      let duration = prev.duration;
      if (startSec !== null && endSec !== null && endSec >= startSec) {
        duration = secToTime(endSec - startSec);
      }
      return { ...prev, start: v, duration };
    });
  };

  const handleChangeEnd = (v: string) => {
    setRowEdit((prev) => {
      if (!prev) return prev;
      const startSec = parseTimeToSec(prev.start);
      const endSec = parseTimeToSec(v);
      let duration = prev.duration;
      if (startSec !== null && endSec !== null && endSec >= startSec) {
        duration = secToTime(endSec - startSec);
      }
      return { ...prev, end: v, duration };
    });
  };

  const handleChangeDuration = (v: string) => {
    setRowEdit((prev) => {
      if (!prev) return prev;
      const startSec = parseTimeToSec(prev.start);
      const durMs = parseDuration(v);
      let end = prev.end;
      if (startSec !== null && durMs !== null) {
        const newEndSec = startSec + Math.floor(durMs / 1000);
        if (newEndSec < 24 * 3600) end = secToTime(newEndSec);
      }
      return { ...prev, duration: v, end };
    });
  };

  const commit = (m: Measurement) => {
    if (!rowEdit || rowEdit.id !== m.id) return;
    if (rowEdit.field === "start") {
      const newStart = parseTime(rowEdit.start, new Date(m.startedAt));
      if (newStart) {
        const endMs = new Date(m.endedAt).getTime();
        const newMs = Math.max(0, endMs - newStart.getTime());
        onUpdate(m.id, { startedAt: newStart.toISOString(), ms: newMs });
      }
    } else if (rowEdit.field === "end") {
      const newEnd = parseTime(rowEdit.end, new Date(m.endedAt));
      if (newEnd) {
        const startMs = new Date(m.startedAt).getTime();
        const newMs = Math.max(0, newEnd.getTime() - startMs);
        onUpdate(m.id, { endedAt: newEnd.toISOString(), ms: newMs });
      }
    } else {
      const newMs = parseDuration(rowEdit.duration);
      if (newMs !== null) {
        const newEnd = new Date(new Date(m.startedAt).getTime() + newMs);
        onUpdate(m.id, { ms: newMs, endedAt: newEnd.toISOString() });
      }
    }
    setRowEdit(null);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, m: Measurement) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(m);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      setRowEdit((prev) =>
        prev && prev.id === m.id
          ? {
              ...prev,
              start: prev.origStart,
              end: prev.origEnd,
              duration: prev.origDuration,
            }
          : prev,
      );
    }
  };

  const isRowEditing = (m: Measurement) => rowEdit?.id === m.id;
  const isFieldEditing = (m: Measurement, field: EditField) =>
    rowEdit?.id === m.id && rowEdit.field === field;

  const renderTimeCell = (m: Measurement, field: "start" | "end") => {
    const editingField = isFieldEditing(m, field);
    const editingRow = isRowEditing(m);
    const previewValue = editingRow
      ? field === "start"
        ? rowEdit!.start
        : rowEdit!.end
      : field === "start"
        ? fmtTime(m.startedAt)
        : fmtTime(m.endedAt);

    if (editingField) {
      return (
        <input
          autoFocus
          type="time"
          step={1}
          value={previewValue}
          onChange={(e) =>
            field === "start" ? handleChangeStart(e.target.value) : handleChangeEnd(e.target.value)
          }
          onBlur={() => commit(m)}
          onKeyDown={(e) => handleKey(e, m)}
          aria-label={field === "start" ? "Starttidspunkt" : "Sluttidspunkt"}
          className="h-8 w-full rounded border border-input bg-background px-2 text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, field)}
        className={cn(
          "group inline-flex h-8 w-full items-center justify-start gap-1.5 rounded px-1 py-0.5 tabular-nums transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          editingRow ? "text-foreground/70" : "text-muted-foreground",
        )}
      >
        <span>{previewValue}</span>
        {!editingRow && (
          <Pencil
            className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  const renderDurationCell = (m: Measurement) => {
    const editingField = isFieldEditing(m, "duration");
    const editingRow = isRowEditing(m);
    const previewValue = editingRow ? rowEdit!.duration : fmtDuration(m.ms);

    if (editingField) {
      return (
        <input
          autoFocus
          type="time"
          step={1}
          value={previewValue}
          onChange={(e) => handleChangeDuration(e.target.value)}
          onBlur={() => commit(m)}
          onKeyDown={(e) => handleKey(e, m)}
          aria-label="Varighed (timer:minutter:sekunder)"
          className="h-8 w-full rounded border border-input bg-background px-2 text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => beginEdit(m, "duration")}
        className={cn(
          "group inline-flex h-8 w-full items-center justify-start gap-1.5 rounded px-1 py-0.5 tabular-nums transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          editingRow ? "text-foreground/70" : "text-muted-foreground",
        )}
      >
        <span>{previewValue}</span>
        {!editingRow && (
          <Pencil
            className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        )}
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
                <TableHead className="h-8 w-[7rem] py-1">
                  {renderSortHeader("start", "Start")}
                </TableHead>
                <TableHead className="h-8 w-[7rem] py-1">
                  {renderSortHeader("end", "Slut")}
                </TableHead>
                <TableHead className="h-8 w-[7rem] py-1">
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
                const rowEditing = isRowEditing(m);
                const editingComment = commentEdit?.id === m.id;
                const showCommentRow = m.category === "andet";
                return (
                  <React.Fragment key={m.id}>
                  <TableRow
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
                  {showCommentRow && (
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableCell colSpan={5} className="py-1 pl-3 pr-2 text-xs">
                        {editingComment ? (
                          <input
                            autoFocus
                            type="text"
                            value={commentEdit!.value}
                            onChange={(e) =>
                              setCommentEdit({ id: m.id, value: e.target.value })
                            }
                            onBlur={() => {
                              const trimmed = commentEdit!.value.trim();
                              onUpdate(m.id, { comment: trimmed === "" ? undefined : trimmed });
                              setCommentEdit(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                (e.target as HTMLInputElement).blur();
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                setCommentEdit(null);
                              }
                            }}
                            placeholder="Tilføj kommentar"
                            aria-label="Kommentar"
                            className="h-8 w-full rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setCommentEdit({ id: m.id, value: m.comment ?? "" })
                            }
                            className={cn(
                              "group inline-flex min-h-8 w-full items-center gap-1.5 rounded px-1 py-0.5 text-left transition-colors hover:bg-[#c471ed]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              m.comment ? "text-muted-foreground" : "text-muted-foreground/50 italic",
                            )}
                          >
                            <Pencil
                              className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                              aria-hidden="true"
                            />
                            <span>{m.comment ?? "Tilføj kommentar"}</span>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
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
                  const patch: Partial<Omit<Measurement, "id">> = {
                    category: pendingCategoryChange.to,
                  };
                  if (
                    pendingCategoryChange.from === "andet" &&
                    pendingCategoryChange.to !== "andet"
                  ) {
                    patch.comment = undefined;
                  }
                  onUpdate(pendingCategoryChange.id, patch);
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
