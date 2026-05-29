import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, getLastCategory, setLastCategory, type Category } from "@/lib/categories";
import type { MeasurementDraft } from "@/hooks/use-measurements";

type Props = {
  startedAt: Date;
  endedAt: Date;
  onCancel: () => void;
  onSave: (draft: MeasurementDraft) => void;
};

// "HH:MM:SS" -> seconds-of-day
function parseHms(value: string): number | null {
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

function toTimeInputValue(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function msToDurationInput(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function parseDuration(value: string): number | null {
  const m = value.match(/^(\d{1,3}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = Number(m[3]);
  if (mi > 59 || s > 59) return null;
  return (h * 3600 + mi * 60 + s) * 1000;
}

function setTimeOnDate(base: Date, secondsOfDay: number): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() + secondsOfDay * 1000);
}

const schema = z
  .object({
    start: z.string(),
    end: z.string(),
    duration: z.string(),
    category: z.string(),
  })
  .superRefine((v, ctx) => {
    if (parseHms(v.start) === null)
      ctx.addIssue({ code: "custom", message: "Ugyldig starttid (HH:MM:SS)", path: ["start"] });
    if (parseHms(v.end) === null)
      ctx.addIssue({ code: "custom", message: "Ugyldig sluttid (HH:MM:SS)", path: ["end"] });
    if (parseDuration(v.duration) === null)
      ctx.addIssue({ code: "custom", message: "Ugyldig varighed (HH:MM:SS)", path: ["duration"] });
  });

export function FinishPanel({ startedAt, endedAt, onCancel, onSave }: Props) {
  const [start, setStart] = useState(toTimeInputValue(startedAt));
  const [end, setEnd] = useState(toTimeInputValue(endedAt));
  const [duration, setDuration] = useState(
    msToDurationInput(endedAt.getTime() - startedAt.getTime()),
  );
  const [category, setCategory] = useState<Category>(getLastCategory());
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const baseDate = useMemo(() => new Date(startedAt), [startedAt]);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const handleStartChange = (value: string) => {
    setStart(value);
    const s = parseHms(value);
    const e = parseHms(end);
    if (s !== null && e !== null && e >= s) {
      setDuration(msToDurationInput((e - s) * 1000));
    }
  };

  const handleEndChange = (value: string) => {
    setEnd(value);
    const s = parseHms(start);
    const e = parseHms(value);
    if (s !== null && e !== null && e >= s) {
      setDuration(msToDurationInput((e - s) * 1000));
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    const ms = parseDuration(value);
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
    const parsed = schema.safeParse({ start, end, duration, category });
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
    const startDate = setTimeOnDate(baseDate, s);
    const endDate = setTimeOnDate(baseDate, en);
    setLastCategory(category);
    const trimmed = comment.trim();
    onSave({
      startedAt: startDate.toISOString(),
      endedAt: endDate.toISOString(),
      ms: dur,
      category,
      comment: category === "andet" && trimmed !== "" ? trimmed : undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="afslut-overskrift"
      className="w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-5 shadow-xl"
    >
      <h2 id="afslut-overskrift" className="mb-4 text-base font-semibold text-foreground">
        Gem registrering
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="finish-start" className="text-xs font-medium text-muted-foreground">
              Starttid
            </label>
            <input
              ref={firstRef}
              id="finish-start"
              type="time"
              step={1}
              value={start}
              onChange={(e) => handleStartChange(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="finish-end" className="text-xs font-medium text-muted-foreground">
              Sluttid
            </label>
            <input
              id="finish-end"
              type="time"
              step={1}
              value={end}
              onChange={(e) => handleEndChange(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="finish-duration" className="text-xs font-medium text-muted-foreground">
              Varighed
            </label>
            <input
              id="finish-duration"
              type="time"
              step={1}
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="finish-category" className="text-xs font-medium text-muted-foreground">
            Kategori
          </label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger id="finish-category" className="h-10">
              <SelectValue placeholder="Vælg kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {category === "andet" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="finish-comment" className="text-xs font-medium text-muted-foreground">
              Kommentar (valgfri)
            </label>
            <textarea
              id="finish-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}

        {error && (
          <p role="alert" aria-live="assertive" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="min-h-11 px-4"
          >
            Annuller
          </Button>
          <Button type="submit" className="min-h-11 px-4 font-semibold">
            Gem
          </Button>
        </div>
      </form>
    </div>
  );
}
