import { useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
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
import { categoryLabel, type Category } from "@/lib/categories";
import type { Measurement } from "@/hooks/use-measurements";
import { fmtDuration, fmtTime, formatTotal, type SummaryFormat } from "./format";
import { cn } from "@/lib/utils";

type Props = {
  category: Category;
  items: Measurement[];
  format: SummaryFormat;
  onEdit: (m: Measurement) => void;
  onDelete: (id: string) => void;
};

export function CategoryGroup({ category, items, format, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const total = items.reduce((sum, m) => sum + m.ms, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border bg-card">
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
                <TableHead className="h-8 w-24 py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
                  Start
                </TableHead>
                <TableHead className="h-8 w-24 py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
                  Slut
                </TableHead>
                <TableHead className="h-8 w-24 py-1 text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
                  Varighed
                </TableHead>
                <TableHead className="h-8 w-24 py-1 text-right text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70">
                  Handlinger
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id} className="border-border/40">
                  <TableCell className="py-1 text-xs tabular-nums">
                    {fmtTime(m.startedAt)}
                  </TableCell>
                  <TableCell className="py-1 text-xs tabular-nums">
                    {fmtTime(m.endedAt)}
                  </TableCell>
                  <TableCell className="py-1 text-xs tabular-nums">
                    {fmtDuration(m.ms)}
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(m)}
                        aria-label="Rediger registrering"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
