import React, { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import { type Category, fallbackCategoryLabel } from "@/lib/categories";
import { useActiveCategoriesFilter } from "@/hooks/use-active-categories";
import { useCategories } from "@/hooks/use-categories";
import type { Measurement } from "@/hooks/use-measurements";
import {
  fmtDuration,
  fmtTime,
  parseDuration,
  parseTime,
} from "@/components/oversigt/format";
import { cn } from "@/lib/utils";

type Props = {
  items: Measurement[];
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
  /** Custom content for the last header cell (default: sr-only "Handlinger"). */
  actionsHeaderContent?: ReactNode;
  /** Width class for the actions/last column. */
  actionsColWidthClass?: string;
  /** Make the table header sticky (use when wrapped in a scroll container). */
  stickyHeader?: boolean;
  /** Optional handlers for the header row (used by Stopur for tooltip). */
  headerRowProps?: React.HTMLAttributes<HTMLTableRowElement>;
  /** Allow sorting by clicking column headers. Defaults to true. */
  sortable?: boolean;
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

export function MeasurementsList({
  items,
  onUpdate,
  onDelete,
  actionsHeaderContent,
  actionsColWidthClass = "w-32",
  stickyHeader = false,
  headerRowProps,
  sortable = true,

}: Props) {
  const [rowEdit, setRowEdit] = useState<RowEdit | null>(null);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
    field: "start",
    dir: sortable ? "asc" : "desc",
  });
  const activeFilter = useActiveCategoriesFilter();
  const { data: categoriesData } = useCategories();
  const allCategories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const categoryLabel = (value: Category) =>
    allCategories.find((c) => c.value === value)?.label ?? fallbackCategoryLabel(value);



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
          lang="da-DK"
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
          lang="da-DK"
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


  return (
    <>
      <Table className="w-full table-fixed">
        <TableHeader className={stickyHeader ? "sticky top-0 z-10 bg-card" : undefined}>
          <TableRow className="border-border/50" {...headerRowProps}>
            <TableHead className="h-10 w-[7rem] py-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
              {sortable ? renderSortHeader("start", "Start") : <span className="px-1">Start</span>}
            </TableHead>
            <TableHead className="h-10 w-[7rem] py-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
              {sortable ? renderSortHeader("end", "Slut") : <span className="px-1">Slut</span>}
            </TableHead>
            <TableHead className="h-10 w-[7rem] py-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
              {sortable ? renderSortHeader("duration", "Varighed") : <span className="px-1">Varighed</span>}
            </TableHead>
            <TableHead className="h-10 w-auto py-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
              Kategori
            </TableHead>
            <TableHead
              className={cn(
                "h-10 py-2 text-right text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70",
                actionsColWidthClass,
              )}
            >
              {actionsHeaderContent ?? <span className="sr-only">Handlinger</span>}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((m) => {
            const rowEditing = isRowEditing(m);
            return (
              <React.Fragment key={m.id}>
                <TableRow
                  data-state={rowEditing ? "selected" : undefined}
                  className={cn(
                    rowEditing
                      ? "border-border/40 bg-brand/15 hover:bg-brand/15 data-[state=selected]:bg-brand/15"
                      : "border-border/40 hover:bg-brand/10",
                  )}
                >

                  <TableCell className="py-1 text-xs">{renderTimeCell(m, "start")}</TableCell>

                  <TableCell className="py-1 text-xs">{renderTimeCell(m, "end")}</TableCell>
                  <TableCell className="py-1 text-xs">{renderDurationCell(m)}</TableCell>
                  <TableCell className="py-1 text-xs">
                    <Select
                      value={m.category}
                      onValueChange={(v) => {
                        const next = v as Category;
                        if (next !== m.category) {
                          onUpdate(m.id, { category: next });
                          toast.success(`Kategori ændret til ${categoryLabel(next)}`);
                        }
                      }}
                    >
                      <SelectTrigger
                        className="h-7 w-full min-w-0 border-transparent bg-transparent text-xs font-medium text-foreground/80 transition-colors hover:border-brand/40 hover:bg-brand/25 hover:text-foreground"
                        aria-label={`Kategori for registrering, nu ${categoryLabel(m.category)}`}
                      >
                        <SelectValue className="truncate" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories
                          .filter(
                            (c) =>
                              activeFilter === null ||
                              activeFilter.includes(c.value) ||
                              c.value === m.category,
                          )
                          .map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex items-center justify-end gap-0">
                      <IconTooltip label="Slet registrering">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => onDelete(m.id)}
                          className="h-9 w-12 px-0 py-0 text-muted-foreground hover:bg-brand/25 hover:text-destructive"
                          aria-label="Slet registrering"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </IconTooltip>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

    </>
  );
}
