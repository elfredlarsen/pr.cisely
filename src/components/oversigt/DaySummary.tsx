import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatTotal, type SummaryFormat } from "./format";

type Props = {
  totalMs: number;
  format: SummaryFormat;
  onFormatChange: (f: SummaryFormat) => void;
};

export function DaySummary({ totalMs, format, onFormatChange }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        Samlet tid:{" "}
        <span className="text-base font-semibold text-foreground tabular-nums">
          {formatTotal(totalMs, format)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vis som</span>
        <ToggleGroup
          type="single"
          size="sm"
          value={format}
          onValueChange={(v) => v && onFormatChange(v as SummaryFormat)}
          aria-label="Vælg visningsformat for samlet tid"
        >
          <ToggleGroupItem
            value="decimal"
            aria-label="Decimaltimer, fx 1,50 t"
            title="Decimaltimer (fx 1,50 t)"
            className="px-3 text-xs"
          >
            Decimaltimer
          </ToggleGroupItem>
          <ToggleGroupItem
            value="hm"
            aria-label="Timer og minutter, fx 1 t 30 min"
            title="Timer og minutter (fx 1 t 30 min)"
            className="px-3 text-xs"
          >
            Timer + minutter
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
