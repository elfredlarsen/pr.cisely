import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatTotal, type SummaryFormat } from "./format";

type Props = {
  totalMs: number;
  format: SummaryFormat;
  onFormatChange: (f: SummaryFormat) => void;
};

export function DaySummary({ totalMs, format, onFormatChange }: Props) {
  return (
    <div className="flex items-center justify-end gap-4">
      <div className="text-sm text-muted-foreground">
        Samlet tid:{" "}
        <span className="text-base font-semibold text-foreground tabular-nums">
          {formatTotal(totalMs, format)}
        </span>
      </div>
      <ToggleGroup
        type="single"
        size="sm"
        value={format}
        onValueChange={(v) => v && onFormatChange(v as SummaryFormat)}
        aria-label="Vælg visningsformat"
      >
        <ToggleGroupItem value="decimal" aria-label="Decimaltimer">
          t
        </ToggleGroupItem>
        <ToggleGroupItem value="hm" aria-label="Timer og minutter">
          t:m
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
