import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getLastCategory,
  setLastCategory,
  type Category,
} from "@/lib/categories";
import { useActiveCategoriesFilter } from "@/hooks/use-active-categories";
import { useCategories } from "@/hooks/use-categories";
import type { MeasurementDraft } from "@/hooks/use-measurements";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseDate: Date;
  initial?: {
    startedAt: string;
    endedAt: string;
    ms: number;
    category: Category;
    comment?: string;
  };
  defaultCategory?: Category;
  onSave: (draft: MeasurementDraft) => void;
  title?: string;
};

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

function parseHms(value: string): number | null {
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  return h * 3600 + mi * 60 + s;
}

function parseDuration(value: string): number | null {
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  return (h * 3600 + mi * 60 + s) * 1000;
}

function msToDurationInput(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function toTimeInput(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function setTimeOnDate(base: Date, secondsOfDay: number): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() + secondsOfDay * 1000);
}

const schema = z
  .object({ start: z.string(), end: z.string(), duration: z.string() })
  .superRefine((v, ctx) => {
    if (parseHms(v.start) === null)
      ctx.addIssue({ code: "custom", message: "Ugyldig starttid", path: ["start"] });
    if (parseHms(v.end) === null)
      ctx.addIssue({ code: "custom", message: "Ugyldig sluttid", path: ["end"] });
    if (parseDuration(v.duration) === null)
      ctx.addIssue({ code: "custom", message: "Ugyldig varighed", path: ["duration"] });
  });

export function MeasurementDialog({
  open,
  onOpenChange,
  baseDate,
  initial,
  defaultCategory,
  onSave,
  title = "Tilføj registrering",
}: Props) {
  const [start, setStart] = useState("09:00:00");
  const [end, setEnd] = useState("09:30:00");
  const [duration, setDuration] = useState("00:30:00");
  const [category, setCategory] = useState<Category>("straksafgoerelse");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeFilter = useActiveCategoriesFilter();
  const { data: allCategories = [] } = useCategories();
  const visibleCategories = allCategories.filter(
    (c) =>
      !c.hidden &&
      (activeFilter === null || activeFilter.includes(c.value) || c.value === category),
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setStart(toTimeInput(initial.startedAt));
      setEnd(toTimeInput(initial.endedAt));
      setDuration(msToDurationInput(initial.ms));
      setCategory(initial.category);
      setComment(initial.comment ?? "");
    } else {
      const now = new Date();
      const startSec = now.getHours() * 3600 + now.getMinutes() * 60;
      const endSec = Math.min(24 * 3600 - 1, startSec + 30 * 60);
      setStart(
        `${pad(Math.floor(startSec / 3600))}:${pad(Math.floor((startSec % 3600) / 60))}:00`,
      );
      setEnd(
        `${pad(Math.floor(endSec / 3600))}:${pad(Math.floor((endSec % 3600) / 60))}:00`,
      );
      setDuration(msToDurationInput((endSec - startSec) * 1000));
      setCategory(defaultCategory ?? getLastCategory());
      setComment("");
    }
  }, [open, initial, defaultCategory]);

  const handleStart = (v: string) => {
    setStart(v);
    const s = parseHms(v);
    const e = parseHms(end);
    if (s !== null && e !== null && e >= s) {
      setDuration(msToDurationInput((e - s) * 1000));
    }
  };
  const handleEnd = (v: string) => {
    setEnd(v);
    const s = parseHms(start);
    const e = parseHms(v);
    if (s !== null && e !== null && e >= s) {
      setDuration(msToDurationInput((e - s) * 1000));
    }
  };
  const handleDuration = (v: string) => {
    setDuration(v);
    const ms = parseDuration(v);
    const s = parseHms(start);
    if (ms !== null && s !== null) {
      const newEndSec = s + Math.floor(ms / 1000);
      if (newEndSec < 24 * 3600) {
        setEnd(
          `${pad(Math.floor(newEndSec / 3600))}:${pad(Math.floor((newEndSec % 3600) / 60))}:${pad(
            newEndSec % 60,
          )}`,
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ start, end, duration });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ugyldige felter");
      return;
    }
    const s = parseHms(start)!;
    const en = parseHms(end)!;
    const dur = parseDuration(duration)!;
    if (en <= s) {
      setError("Sluttid skal være efter starttid");
      return;
    }
    if (dur <= 0) {
      setError("Varighed skal være større end 0");
      return;
    }
    setLastCategory(category);
    const trimmed = comment.trim();
    onSave({
      startedAt: setTimeOnDate(baseDate, s).toISOString(),
      endedAt: setTimeOnDate(baseDate, en).toISOString(),
      ms: dur,
      category,
      comment: category === "andet" && trimmed !== "" ? trimmed : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Indtast start, slut, varighed og kategori for registreringen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="md-start" className="text-xs font-medium text-muted-foreground">
                Starttid
              </label>
              <input
                id="md-start"
                type="time"
                step={1}
                value={start}
                onChange={(e) => handleStart(e.target.value)}
                className="h-10 w-auto min-w-[7rem] rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="md-end" className="text-xs font-medium text-muted-foreground">
                Sluttid
              </label>
              <input
                id="md-end"
                type="time"
                step={1}
                value={end}
                onChange={(e) => handleEnd(e.target.value)}
                className="h-10 w-auto min-w-[7rem] rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="md-dur" className="text-xs font-medium text-muted-foreground">
                Varighed
              </label>
              <input
                id="md-dur"
                type="time"
                step={1}
                value={duration}
                onChange={(e) => handleDuration(e.target.value)}
                className="h-10 w-auto min-w-[7rem] rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="md-cat" className="text-xs font-medium text-muted-foreground">
              Kategori
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="md-cat" className="h-10">
                <SelectValue placeholder="Vælg kategori" />
              </SelectTrigger>
              <SelectContent>
                {visibleCategories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === "andet" && (
            <div className="flex flex-col gap-1">
              <label htmlFor="md-comment" className="text-xs font-medium text-muted-foreground">
                Kommentar (valgfri)
              </label>
              <textarea
                id="md-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-11 px-4"
            >
              Annuller
            </Button>
            <Button type="submit" className="min-h-11 px-4 font-semibold">
              Gem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
