import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Stopwatch } from "@/components/stopwatch/Stopwatch";
import { useStopwatch } from "@/components/stopwatch/StopwatchContext";
import { TopNav } from "@/components/stopwatch/TopNav";
import { MeasurementsTable } from "@/components/stopwatch/MeasurementsTable";
import { MeasurementDialog } from "@/components/oversigt/MeasurementDialog";
import { Button } from "@/components/ui/button";
import { useLastCategory } from "@/hooks/use-last-category";
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
  const { visibleToday, loaded, add, update, remove } = useMeasurements();
  const [pending, setPending] = useState<{ startedAt: Date; endedAt: Date } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const { reset: resetStopwatch } = useStopwatch();
  const lastCategory = useLastCategory();

  const handleRequestFinish = (startedAt: Date, endedAt: Date) => {
    setPending({ startedAt, endedAt });
  };

  const handleSave = async (draft: MeasurementDraft) => {
    await add(draft);
    setPending(null);
    resetStopwatch();
    toast.success("Registrering gemt");
  };

  const handleAddSave = async (draft: MeasurementDraft) => {
    await add(draft);
    toast.success("Registrering tilføjet");
  };

  const handleCancel = () => {
    setPending(null);
  };

  const pendingInitial = useMemo(
    () =>
      pending
        ? {
            startedAt: pending.startedAt.toISOString(),
            endedAt: pending.endedAt.toISOString(),
            ms: pending.endedAt.getTime() - pending.startedAt.getTime(),
            category: lastCategory ?? "",
          }
        : undefined,
    [pending, lastCategory],
  );

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
          />
          <div className="-mt-4 flex justify-center pb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddOpen(true)}
              className="min-h-11 px-4 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Glemt at tage tid? Tilføj manuelt
            </Button>
          </div>
        </div>
        <MeasurementDialog
          open={pending !== null}
          onOpenChange={(o) => {
            if (!o) handleCancel();
          }}
          baseDate={pending?.startedAt ?? new Date()}
          initial={pendingInitial}
          onSave={handleSave}
          title="Gem registrering"
        />

        <div className="flex min-h-[60vh] flex-1 flex-col items-center px-6 pt-2 pb-8">
          <MeasurementsTable
            measurements={visibleToday}
            onUpdate={update}
            onDelete={remove}
            loaded={loaded}
            limit={5}
          />
        </div>
      </main>

      <MeasurementDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        baseDate={new Date()}
        onSave={handleAddSave}
        title="Tilføj registrering"
      />
    </div>
  );
}
