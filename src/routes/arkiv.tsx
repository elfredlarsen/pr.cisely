import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TopNav } from "@/components/stopwatch/TopNav";
import { Button } from "@/components/ui/button";
import { useMeasurements, type Measurement } from "@/hooks/use-measurements";
import { CATEGORIES, type Category } from "@/lib/categories";
import { DateNavigator } from "@/components/oversigt/DateNavigator";
import { DaySummary } from "@/components/oversigt/DaySummary";
import { CategoryGroup } from "@/components/oversigt/CategoryGroup";
import { MeasurementDialog } from "@/components/oversigt/MeasurementDialog";
import type { SummaryFormat } from "@/components/oversigt/format";
import type { MeasurementDraft } from "@/hooks/use-measurements";

export const Route = createFileRoute("/arkiv")({
  head: () => ({
    meta: [
      { title: "Oversigt · pr:cisely" },
      {
        name: "description",
        content: "Oversigt over dine tidsregistreringer grupperet efter kategori.",
      },
      { property: "og:title", content: "Oversigt · pr:cisely" },
      {
        property: "og:description",
        content: "Se og rediger dine tidsregistreringer pr. dag og kategori.",
      },
    ],
  }),
  component: OversigtPage,
});

const FORMAT_KEY = "precisely.summaryFormat";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function OversigtPage() {
  const { measurements, add, update, remove } = useMeasurements();
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [format, setFormat] = useState<SummaryFormat>("decimal");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Measurement | null>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(FORMAT_KEY);
      if (v === "decimal" || v === "hm") setFormat(v);
    } catch {
      // ignore
    }
  }, []);

  const handleFormatChange = (f: SummaryFormat) => {
    setFormat(f);
    try {
      window.localStorage.setItem(FORMAT_KEY, f);
    } catch {
      // ignore
    }
  };

  const dayMeasurements = useMemo(
    () =>
      measurements.filter((m) => !m.hidden && isSameDay(new Date(m.endedAt), date)),
    [measurements, date],
  );

  const datesWithData = useMemo(() => {
    const set = new Map<string, Date>();
    for (const m of measurements) {
      if (m.hidden) continue;
      const d = new Date(m.endedAt);
      d.setHours(0, 0, 0, 0);
      set.set(d.toISOString(), d);
    }
    return Array.from(set.values());
  }, [measurements]);

  const totalMs = dayMeasurements.reduce((sum, m) => sum + m.ms, 0);

  const byCategory = useMemo(() => {
    const map = new Map<Category, Measurement[]>();
    for (const m of dayMeasurements) {
      const arr = map.get(m.category) ?? [];
      arr.push(m);
      map.set(m.category, arr);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
      );
    }
    return map;
  }, [dayMeasurements]);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (m: Measurement) => {
    setEditing(m);
    setDialogOpen(true);
  };

  const handleSave = (draft: MeasurementDraft) => {
    if (editing) {
      update(editing.id, {
        startedAt: draft.startedAt,
        endedAt: draft.endedAt,
        ms: draft.ms,
        category: draft.category,
      });
      toast.success("Registrering opdateret");
    } else {
      add(draft);
      toast.success("Registrering tilføjet");
    }
  };

  const handleDelete = (id: string) => {
    remove(id);
    toast.success("Registrering slettet");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="sr-only">Oversigt</h1>

        <DateNavigator
          value={date}
          onChange={(d) => {
            const copy = new Date(d);
            copy.setHours(0, 0, 0, 0);
            setDate(copy);
          }}
          datesWithData={datesWithData}
        />

        <div className="mt-8">
          <DaySummary
            totalMs={totalMs}
            format={format}
            onFormatChange={handleFormatChange}
          />
        </div>

        <div className="mt-6 space-y-2">
          {dayMeasurements.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Ingen registreringer denne dag
            </p>
          ) : (
            CATEGORIES.filter((c) => (byCategory.get(c.value)?.length ?? 0) > 0).map(
              (c) => (
                <CategoryGroup
                  key={c.value}
                  category={c.value}
                  items={byCategory.get(c.value) ?? []}
                  format={format}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ),
            )
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <Button type="button" onClick={handleAdd} className="min-h-11 px-5 font-semibold">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tilføj registrering
          </Button>
        </div>
      </main>

      <MeasurementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        baseDate={date}
        initial={
          editing
            ? {
                startedAt: editing.startedAt,
                endedAt: editing.endedAt,
                ms: editing.ms,
                category: editing.category,
              }
            : undefined
        }
        onSave={handleSave}
        title={editing ? "Rediger registrering" : "Tilføj registrering"}
      />
    </div>
  );
}
