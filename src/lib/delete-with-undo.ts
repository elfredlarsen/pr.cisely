import { toast } from "sonner";
import type { Measurement, MeasurementDraft } from "@/hooks/use-measurements";

/** Delete one measurement immediately and offer a 5 s undo that re-creates it. */
export function deleteWithUndo(
  item: Measurement | undefined,
  remove: (id: string) => void,
  add: (draft: MeasurementDraft) => Promise<unknown> | unknown,
) {
  if (!item) return;
  remove(item.id);
  toast("Registrering slettet", {
    duration: 5000,
    action: {
      label: "Fortryd",
      onClick: async () => {
        try {
          await add({
            startedAt: item.startedAt,
            endedAt: item.endedAt,
            ms: item.ms,
            category: item.category,
          });
        } catch {
          toast.error("Kunne ikke gendanne registreringen");
        }
      },
    },
  });
}
