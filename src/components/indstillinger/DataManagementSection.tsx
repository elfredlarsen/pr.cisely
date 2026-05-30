import { useEffect, useState } from "react";
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

const AUTO_DELETE_KEY = "precisely.autoDeleteDays";

type AutoDeleteValue = "30" | "60" | "90" | "180" | "365" | "never";

const OPTIONS: { value: AutoDeleteValue; label: string }[] = [
  { value: "30", label: "30 dage" },
  { value: "60", label: "60 dage" },
  { value: "90", label: "90 dage" },
  { value: "180", label: "180 dage" },
  { value: "365", label: "365 dage" },
  { value: "never", label: "Aldrig" },
];

function isAutoDeleteValue(v: string): v is AutoDeleteValue {
  return ["30", "60", "90", "180", "365", "never"].includes(v);
}

export function DataManagementSection() {
  const { removeAll } = useMeasurements();
  const [autoDelete, setAutoDelete] = useState<AutoDeleteValue>("never");

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(AUTO_DELETE_KEY);
      if (v && isAutoDeleteValue(v)) setAutoDelete(v);
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (v: string) => {
    if (!isAutoDeleteValue(v)) return;
    setAutoDelete(v);
    try {
      window.localStorage.setItem(AUTO_DELETE_KEY, v);
    } catch {
      // ignore
    }
    toast.success("Auto-slet opdateret");
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
        <Select value={autoDelete} onValueChange={handleChange}>
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
