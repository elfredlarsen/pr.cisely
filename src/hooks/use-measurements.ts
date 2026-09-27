import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { isValidCategory, type Category } from "@/lib/categories";
import { usePreviewMode } from "@/lib/preview-mode";
import {
  createMeasurement,
  deleteMeasurement,
  listMeasurements,
  removeAllMeasurements,
  removeMeasurementsInRange,
  updateMeasurement,
  type MeasurementRow,
} from "@/lib/measurements.functions";
import { applyRetention } from "@/lib/retention.functions";
export type Measurement = {
  id: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  ms: number;
  category: Category;
};


export type MeasurementDraft = {
  startedAt: string;
  endedAt: string;
  ms: number;
  category: Category;
};

const QUERY_KEY = ["measurements"] as const;
const PREVIEW_KEY = "precisely.measurements.preview";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function dateBounds(ref: Date): { from: string; to: string } {
  const start = new Date(ref);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

function todayBounds(): { from: string; to: string } {
  return dateBounds(new Date());
}

function rowToMeasurement(row: MeasurementRow): Measurement | null {
  if (!isValidCategory(row.category)) return null;
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    ms: Number(row.ms),
    category: row.category,
  };
}

// ---------------- Preview-mode fallback (localStorage) ----------------

function previewRead(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PREVIEW_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Measurement =>
        m && typeof m === "object" && isValidCategory((m as Measurement).category),
    );
  } catch {
    return [];
  }
}

function previewWrite(items: Measurement[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function usePreviewMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMeasurements(previewRead());
    setLoaded(true);
  }, []);

  const persist = useCallback((updater: (prev: Measurement[]) => Measurement[]) => {
    setMeasurements((prev) => {
      const next = updater(prev);
      previewWrite(next);
      return next;
    });
  }, []);

  const add = useCallback(
    async (draft: MeasurementDraft): Promise<void> =>
      persist((prev) => [
        {
          id: newId(),
          startedAt: draft.startedAt,
          endedAt: draft.endedAt,
          ms: draft.ms,
          category: draft.category,
        },
        ...prev,
      ]),
    [persist],
  );
  const update = useCallback(
    (id: string, patch: Partial<Omit<Measurement, "id">>) =>
      persist((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    [persist],
  );
  const remove = useCallback(
    (id: string) => persist((prev) => prev.filter((m) => m.id !== id)),
    [persist],
  );
  const removeByDate = useCallback(
    (ref: Date) => persist((prev) => prev.filter((m) => !isSameLocalDay(m.endedAt, ref))),
    [persist],
  );
  const removeAllToday = useCallback(() => {
    const today = new Date();
    persist((prev) => prev.filter((m) => !isSameLocalDay(m.endedAt, today)));
  }, [persist]);
  const removeAll = useCallback(() => persist(() => []), [persist]);

  return { measurements, loaded, add, update, remove, removeByDate, removeAllToday, removeAll };
}

// ---------------- Supabase-backed implementation ----------------

function useSupabaseMeasurements(enabled: boolean) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMeasurements);
  const createFn = useServerFn(createMeasurement);
  const updateFn = useServerFn(updateMeasurement);
  const deleteFn = useServerFn(deleteMeasurement);
  const removeRangeFn = useServerFn(removeMeasurementsInRange);
  const removeAllFn = useServerFn(removeAllMeasurements);
  const applyRetentionFn = useServerFn(applyRetention);

  // Doven oprydning: kør én gang per mount, ikke ved hver refetch.
  const retentionRanRef = useRef(false);
  useEffect(() => {
    if (!enabled || retentionRanRef.current) return;
    retentionRanRef.current = true;
    applyRetentionFn()
      .then((res) => {
        if (res.deleted > 0) {
          qc.invalidateQueries({ queryKey: QUERY_KEY });
        }
      })
      .catch((err) => {
        console.warn("[retention] apply failed:", err);
      });
  }, [enabled, applyRetentionFn, qc]);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const rows = await listFn();
      return rows.map(rowToMeasurement).filter((m): m is Measurement => m !== null);
    },
    enabled,
  });

  const serverMeasurements = query.data ?? [];
  const loaded = enabled ? query.isFetched : true;

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: QUERY_KEY });
  }, [qc]);

  const measurements = serverMeasurements;

  // Ryd den gamle offline-kø fra browseren (funktionen er fjernet).
  useEffect(() => {
    try {
      window.localStorage.removeItem("precisely.offline-queue.v1");
    } catch {
      // ignore
    }
  }, []);

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Measurement, "id">> }) =>
      updateFn({
        data: {
          id,
          ...(patch.startedAt !== undefined ? { started_at: patch.startedAt } : {}),
          ...(patch.endedAt !== undefined ? { ended_at: patch.endedAt } : {}),
          ...(patch.ms !== undefined ? { ms: patch.ms } : {}),
          ...(patch.category !== undefined ? { category: patch.category } : {}),
        },
      }),
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
  });

  const removeRangeMut = useMutation({
    mutationFn: (bounds: { from: string; to: string }) => removeRangeFn({ data: bounds }),
    onSuccess: invalidate,
  });

  const removeAllMut = useMutation({
    mutationFn: () => removeAllFn(),
    onSuccess: invalidate,
  });

  const add = useCallback(
    async (draft: MeasurementDraft): Promise<void> => {
      await createFn({
        data: {
          started_at: draft.startedAt,
          ended_at: draft.endedAt,
          ms: draft.ms,
          category: draft.category,
        },
      });
      invalidate();
    },
    [createFn, invalidate],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<Measurement, "id">>) => updateMut.mutate({ id, patch }),
    [updateMut],
  );
  const remove = useCallback((id: string) => deleteMut.mutate(id), [deleteMut]);
  const removeByDate = useCallback(
    (ref: Date) => removeRangeMut.mutate(dateBounds(ref)),
    [removeRangeMut],
  );
  const removeAllToday = useCallback(
    () => removeRangeMut.mutate(todayBounds()),
    [removeRangeMut],
  );
  const removeAll = useCallback(() => removeAllMut.mutate(), [removeAllMut]);

  return { measurements, loaded, add, update, remove, removeByDate, removeAllToday, removeAll };
}


export function useMeasurements() {
  const preview = usePreviewMode();
  const previewApi = usePreviewMeasurements();
  const supaApi = useSupabaseMeasurements(!preview);

  const api = preview ? previewApi : supaApi;

  const visibleToday = useMemo(() => {
    const today = new Date();
    return api.measurements.filter((m) => isSameLocalDay(m.endedAt, today));
  }, [api.measurements]);

  return {
    ...api,
    visibleToday,
  };
}
