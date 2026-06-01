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
};

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
  const label = useCategoryLabel(category);

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
              {label}
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
