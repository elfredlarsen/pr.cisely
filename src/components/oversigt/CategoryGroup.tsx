import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type Category } from "@/lib/categories";
import { useCategoryLabel } from "@/hooks/use-categories";
import type { Measurement } from "@/hooks/use-measurements";
import { formatTotal, type SummaryFormat } from "./format";
import { cn } from "@/lib/utils";
import { MeasurementsList } from "@/components/measurements/MeasurementsList";

type Props = {
  category: Category;
  items: Measurement[];
  format: SummaryFormat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<Omit<Measurement, "id">>) => void;
  onDelete: (id: string) => void;
  entered: boolean;
  onEnteredChange: (entered: boolean) => void;
};

export function CategoryGroup({
  category,
  items,
  format,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  entered,
  onEnteredChange,
}: Props) {
  const total = items.reduce((sum, m) => sum + m.ms, 0);
  const label = useCategoryLabel(category);

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-card transition-colors",
        entered && "bg-secondary/40",
      )}
    >
      <div className="flex items-center gap-1 pl-3">
        <label
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
          title="Markér som indtastet i mTime"
        >
          <input
            type="checkbox"
            checked={entered}
            onChange={(e) => onEnteredChange(e.target.checked)}
            aria-label={`${label} er indtastet i mTime`}
            className="h-5 w-5 cursor-pointer rounded accent-[var(--primary)]"
          />
        </label>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex items-center gap-2">
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-150",
                  open && "rotate-90",
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-sm font-medium text-foreground",
                  entered && "text-muted-foreground line-through",
                )}
              >
                {label}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                ({items.length})
              </span>
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              <span className={cn("font-semibold text-foreground", entered && "text-muted-foreground")}>
                {formatTotal(total, format)}
              </span>
            </span>
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="border-t border-border px-2 pb-2">
          <MeasurementsList
            items={items}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
