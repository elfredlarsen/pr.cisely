import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMeasurements } from "@/hooks/use-measurements";
import { getRetentionDays, setRetentionDays } from "@/lib/retention.functions";

type AutoDeleteValue = "30" | "60" | "90" | "180" | "365" | "never";

const OPTIONS: { value: AutoDeleteValue; label: string }[] = [
  { value: "30", label: "30 dage" },
  { value: "60", label: "60 dage" },
  { value: "90", label: "90 dage" },
  { value: "180", label: "180 dage" },
  { value: "365", label: "365 dage" },
  { value: "never", label: "Aldrig" },
];

const RETENTION_KEY = ["retention-days"] as const;

function daysToValue(days: number | null): AutoDeleteValue {
  if (days === null) return "never";
  const s = String(days);
  if (s === "30" || s === "60" || s === "90" || s === "180" || s === "365") return s;
  return "never";
}

function valueToDays(v: AutoDeleteValue): number | null {
  if (v === "never") return null;
  return Number(v);
}

export function DataManagementSection() {
  const { removeAll } = useMeasurements();
  const qc = useQueryClient();
  const getFn = useServerFn(getRetentionDays);
  const setFn = useServerFn(setRetentionDays);

  const query = useQuery({
    queryKey: RETENTION_KEY,
    queryFn: () => getFn(),
  });

  const mutation = useMutation({
    mutationFn: (retentionDays: number | null) => setFn({ data: { retentionDays } }),
    onSuccess: (_res, retentionDays) => {
      qc.setQueryData(RETENTION_KEY, { retentionDays });
      toast.success("Auto-slet opdateret");
    },
    onError: () => {
      toast.error("Kunne ikke gemme. Prøv igen.");
      qc.invalidateQueries({ queryKey: RETENTION_KEY });
    },
  });

  const currentValue: AutoDeleteValue = daysToValue(query.data?.retentionDays ?? null);
  const disabled = query.isLoading || mutation.isPending;

  const handleChange = (v: string) => {
    const next = v as AutoDeleteValue;
    if (!OPTIONS.some((o) => o.value === next)) return;
    mutation.mutate(valueToDays(next));
  };

  const handleDeleteAll = () => {
    removeAll();
    toast.success("Al historik slettet");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="auto-delete-select" className="text-sm font-medium">
          Auto-slet
        </Label>
        <Select value={currentValue} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger
            id="auto-delete-select"
            className="h-11 w-full rounded-md"
          >
            <SelectValue placeholder="Vælg periode" />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Registreringer ældre end det valgte antal dage slettes automatisk.
        </p>
      </div>

      <div className="flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 px-5 font-semibold"
            >
              Slet al historik
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
              <AlertDialogDescription>
                Denne handling kan ikke fortrydes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuller</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Slet alt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
