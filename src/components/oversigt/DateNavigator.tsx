import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { da } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import { cn } from "@/lib/utils";

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  datesWithData: Date[];
};

function formatDanish(d: Date): string {
  const f = new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  // "tirsdag den 26. maj 2026" → "Tirsdag d. 26. maj 2026"
  const cap = f.charAt(0).toUpperCase() + f.slice(1);
  return cap.replace(" den ", " d. ");
}

export function DateNavigator({ value, onChange, datesWithData }: Props) {
  const [open, setOpen] = useState(false);

  const prev = () => {
    const d = new Date(value);
    d.setDate(d.getDate() - 1);
    onChange(d);
  };
  const next = () => {
    const d = new Date(value);
    d.setDate(d.getDate() + 1);
    onChange(d);
  };

  const dataModifier = useMemo(() => datesWithData, [datesWithData]);

  return (
    <div className="flex items-center justify-center gap-2">
      <IconTooltip label="Forrige dag">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={prev}
          aria-label="Forrige dag"
          className="h-11 w-11"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
      </IconTooltip>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 px-4 text-base font-medium"
          >
            {formatDanish(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (d) {
                onChange(d);
                setOpen(false);
              }
            }}
            locale={da}
            weekStartsOn={1}
            modifiers={{ hasData: dataModifier }}
            modifiersClassNames={{
              hasData:
                "font-semibold text-primary underline underline-offset-4 decoration-primary",
            }}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <IconTooltip label="Næste dag">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={next}
          aria-label="Næste dag"
          className="h-11 w-11"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </IconTooltip>
    </div>
  );
}
