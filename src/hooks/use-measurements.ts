import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { isValidCategory, type Category } from "@/lib/categories";
import { usePreviewMode } from "@/lib/preview-mode";
import {
  createMeasurement,
  deleteMeasurement,
  hideMeasurementsInRange,
  listMeasurements,
  removeAllMeasurements,
  removeMeasurementsInRange,
  updateMeasurement,
  type MeasurementRow,
} from "@/lib/measurements.functions";
import { applyRetention } from "@/lib/retention.functions";
import {
  dequeueDraft,
  enqueueDraft,
  markAttempt,
  TEMP_ID_PREFIX,
  useOfflineQueue,
  type QueuedDraft,
} from "@/lib/offline-queue";


export type Measurement = {
  id: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  ms: number;
  category: Category;
  hidden: boolean;
  comment?: string;
  /** True hvis posten endnu kun findes i den lokale offline-kø. */
  pending?: boolean;
};


export type MeasurementDraft = {
  startedAt: string;
  endedAt: string;
  ms: number;
  category: Category;
  comment?: string;
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

function todayBounds(): { from: string; to: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

function rowToMeasurement(row: MeasurementRow): Measurement | null {
  if (!isValidCategory(row.category)) return null;
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    ms: Number(row.ms),
    category: row.category,
    hidden: row.hidden,
    comment: row.comment ?? undefined,
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
    (draft: MeasurementDraft) =>
      persist((prev) => [
        {
          id: newId(),
          startedAt: draft.startedAt,
          endedAt: draft.endedAt,
          ms: draft.ms,
          category: draft.category,
          hidden: false,
          comment: draft.comment,
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
  const hide = useCallback(
    (id: string) =>
      persist((prev) => prev.map((m) => (m.id === id ? { ...m, hidden: true } : m))),
    [persist],
  );
  const unhide = useCallback(
    (id: string) =>
      persist((prev) => prev.map((m) => (m.id === id ? { ...m, hidden: false } : m))),
    [persist],
  );
  const hideAllToday = useCallback(() => {
    const today = new Date();
    persist((prev) =>
      prev.map((m) =>
        !m.hidden && isSameLocalDay(m.endedAt, today) ? { ...m, hidden: true } : m,
      ),
    );
  }, [persist]);
  const removeAllToday = useCallback(() => {
    const today = new Date();
    persist((prev) => prev.filter((m) => m.hidden || !isSameLocalDay(m.endedAt, today)));
  }, [persist]);
  const removeAll = useCallback(() => persist(() => []), [persist]);

  return { measurements, loaded, add, update, remove, hide, unhide, hideAllToday, removeAllToday, removeAll };
}

// ---------------- Supabase-backed implementation ----------------

function useSupabaseMeasurements(enabled: boolean) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMeasurements);
  const createFn = useServerFn(createMeasurement);
  const updateFn = useServerFn(updateMeasurement);
  const deleteFn = useServerFn(deleteMeasurement);
  const removeRangeFn = useServerFn(removeMeasurementsInRange);
  const hideRangeFn = useServerFn(hideMeasurementsInRange);
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

  // ----- Offline-kø -----
  const queuedDrafts = useOfflineQueue();
  const queuedAsMeasurements = useMemo<Measurement[]>(
    () =>
      queuedDrafts
        .filter((q) => isValidCategory(q.draft.category))
        .map((q) => ({
          id: q.tempId,
          startedAt: q.draft.startedAt,
          endedAt: q.draft.endedAt,
          ms: q.draft.ms,
          category: q.draft.category,
          hidden: false,
          comment: q.draft.comment,
          pending: true,
        })),
    [queuedDrafts],
  );

  const measurements = useMemo<Measurement[]>(
    () => [...queuedAsMeasurements, ...serverMeasurements],
    [queuedAsMeasurements, serverMeasurements],
  );

  // Synker én post fra køen. Returnerer true ved succes, false ved netværksfejl
  // (post bliver), eller hvis posten allerede er fjernet.
  const syncOne = useCallback(
    async (item: QueuedDraft): Promise<boolean> => {
      try {
        await createFn({
          data: {
            started_at: item.draft.startedAt,
            ended_at: item.draft.endedAt,
            ms: item.draft.ms,
            category: item.draft.category,
            comment: item.draft.comment,
          },
        });
        dequeueDraft(item.tempId);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const online = typeof navigator === "undefined" ? true : navigator.onLine;
        const looksNetwork =
          !online ||
          err instanceof TypeError ||
          /fetch|network|load failed|connection/i.test(msg);
        if (looksNetwork) {
          markAttempt(item.tempId, msg);
          return false;
        }
        // Permanent fejl (fx validering) — drop posten, vi vil ikke loope.
        console.error("[offline-queue] permanent fejl, dropper post:", msg);
        dequeueDraft(item.tempId);
        toast.error("En offline-måling kunne ikke gemmes og blev fjernet", {
          description: msg,
        });
        return true;
      }
    },
    [createFn],
  );

  const syncingRef = useRef(false);
  const syncAll = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const now = Date.now();
      const ready = queuedDrafts.filter((q) => q.nextAttemptAt <= now);
      let anySuccess = false;
      for (const item of ready) {
        const ok = await syncOne(item);
        if (ok) anySuccess = true;
      }
      if (anySuccess) invalidate();
    } finally {
      syncingRef.current = false;
    }
  }, [queuedDrafts, syncOne, invalidate]);

  // Trigger sync når vi kommer online, ved tab-fokus og ved mount.
  useEffect(() => {
    if (!enabled) return;
    if (queuedDrafts.length === 0) return;
    void syncAll();
    const onOnline = () => void syncAll();
    const onFocus = () => void syncAll();
    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, queuedDrafts.length, syncAll]);

  // Periodisk retry (backoff): tjek hvert 5. sekund om noget er klar.
  useEffect(() => {
    if (!enabled || queuedDrafts.length === 0) return;
    const interval = window.setInterval(() => {
      void syncAll();
    }, 5_000);
    return () => window.clearInterval(interval);
  }, [enabled, queuedDrafts.length, syncAll]);

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Measurement, "id">> }) =>
      updateFn({
        data: {
          id,
          ...(patch.startedAt !== undefined ? { started_at: patch.startedAt } : {}),
          ...(patch.endedAt !== undefined ? { ended_at: patch.endedAt } : {}),
          ...(patch.ms !== undefined ? { ms: patch.ms } : {}),
          ...(patch.category !== undefined ? { category: patch.category } : {}),
          ...(patch.hidden !== undefined ? { hidden: patch.hidden } : {}),
          ...(patch.comment !== undefined ? { comment: patch.comment ?? null } : {}),
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

  const hideRangeMut = useMutation({
    mutationFn: (bounds: { from: string; to: string }) => hideRangeFn({ data: bounds }),
    onSuccess: invalidate,
  });

  const removeAllMut = useMutation({
    mutationFn: () => removeAllFn(),
    onSuccess: invalidate,
  });

  const add = useCallback(
    (draft: MeasurementDraft) => {
      const item = enqueueDraft(draft);
      if (!item) {
        toast.error("Offline-kø er fuld — kunne ikke gemme");
        return;
      }
      // Forsøg straks; lykkes det fjernes posten fra køen i syncOne.
      void syncOne(item).then((ok) => {
        if (ok) {
          invalidate();
        } else {
          toast.message("Gemt offline — synkroniseres når du er online igen");
        }
      });
    },
    [syncOne, invalidate],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<Measurement, "id">>) => {
      if (id.startsWith(TEMP_ID_PREFIX)) {
        toast.message("Venter på synk — prøv igen om et øjeblik");
        return;
      }
      updateMut.mutate({ id, patch });
    },
    [updateMut],
  );
  const remove = useCallback(
    (id: string) => {
      if (id.startsWith(TEMP_ID_PREFIX)) {
        dequeueDraft(id);
        return;
      }
      deleteMut.mutate(id);
    },
    [deleteMut],
  );
  const hide = useCallback(
    (id: string) => {
      if (id.startsWith(TEMP_ID_PREFIX)) return;
      updateMut.mutate({ id, patch: { hidden: true } });
    },
    [updateMut],
  );
  const unhide = useCallback(
    (id: string) => {
      if (id.startsWith(TEMP_ID_PREFIX)) return;
      updateMut.mutate({ id, patch: { hidden: false } });
    },
    [updateMut],
  );
  const hideAllToday = useCallback(() => hideRangeMut.mutate(todayBounds()), [hideRangeMut]);
  const removeAllToday = useCallback(
    () => removeRangeMut.mutate(todayBounds()),
    [removeRangeMut],
  );
  const removeAll = useCallback(() => removeAllMut.mutate(), [removeAllMut]);

  return { measurements, loaded, add, update, remove, hide, unhide, hideAllToday, removeAllToday, removeAll };
}


export function useMeasurements() {
  const preview = usePreviewMode();
  const previewApi = usePreviewMeasurements();
  const supaApi = useSupabaseMeasurements(!preview);

  const api = preview ? previewApi : supaApi;

  const visibleToday = useMemo(() => {
    const today = new Date();
    return api.measurements.filter((m) => !m.hidden && isSameLocalDay(m.endedAt, today));
  }, [api.measurements]);

  const hiddenAll = useMemo(() => api.measurements.filter((m) => m.hidden), [api.measurements]);

  return {
    ...api,
    visibleToday,
    hiddenAll,
  };
}

export { isSameLocalDay };
