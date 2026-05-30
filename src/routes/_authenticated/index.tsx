import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Stopwatch } from "@/components/stopwatch/Stopwatch";
import { TopNav } from "@/components/stopwatch/TopNav";
import { MeasurementsTable } from "@/components/stopwatch/MeasurementsTable";
import { MeasurementDialog } from "@/components/oversigt/MeasurementDialog";
import { getLastCategory } from "@/lib/categories";
import { useMeasurements, type MeasurementDraft } from "@/hooks/use-measurements";


export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "pr:cisely · Stopur" },
      {
        name: "description",
        content:
          "Stopur til præcis tidsregistrering med pr:cisely — start, pause og fortsæt din måling.",
      },
      { property: "og:title", content: "pr:cisely · Stopur" },
      {
        property: "og:description",
        content: "Præcis tidsregistrering med et enkelt og hurtigt stopur.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { visibleToday, add, update, remove } = useMeasurements();
  const [pending, setPending] = useState<{ startedAt: Date; endedAt: Date } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleRequestFinish = (startedAt: Date, endedAt: Date) => {
    setPending({ startedAt, endedAt });
  };

  const handleSave = (draft: MeasurementDraft) => {
    add(draft);
    setPending(null);
    setResetKey((k) => k + 1);
    toast.success("Registrering gemt");
  };

  const handleCancel = () => {
    setPending(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#stopur-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      >
        Spring til hovedindhold
      </a>
      <TopNav />
      <main
        id="stopur-main"
        className="flex flex-1 flex-col"
      >
        <div className="relative shrink-0">
          <Stopwatch
            onRequestFinish={handleRequestFinish}
            finishOpen={pending !== null}
            resetKey={resetKey}
          />
        </div>
        <MeasurementDialog
          open={pending !== null}
          onOpenChange={(o) => {
            if (!o) handleCancel();
          }}
          baseDate={pending?.startedAt ?? new Date()}
          initial={
            pending
              ? {
                  startedAt: pending.startedAt.toISOString(),
                  endedAt: pending.endedAt.toISOString(),
                  ms: pending.endedAt.getTime() - pending.startedAt.getTime(),
                  category: getLastCategory() ?? "",
                }
              : undefined
          }
          onSave={handleSave}
          title="Gem registrering"
        />

        <div className="flex min-h-0 flex-1 flex-col items-center px-6 pt-2 pb-8">
          <MeasurementsTable
            measurements={visibleToday}
            onUpdate={update}
            onDelete={remove}
          />
        </div>
      </main>
    </div>
  );
}
