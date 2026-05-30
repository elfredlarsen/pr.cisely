import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

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
import { isValidCategory, type Category } from "@/lib/categories";

export type Measurement = {
  id: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  ms: number;
  category: Category;
  hidden: boolean;
  comment?: string;
};

export type MeasurementDraft = {
  startedAt: string;
  endedAt: string;
  ms: number;
  category: Category;
  comment?: string;
};

const QUERY_KEY = ["measurements"] as const;

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
const STORAGE_KEY = "precisely.measurements";
const SEED_KEY = "precisely.measurements.seeded";

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

// ---------------- Preview-mode fallback (localStorage) ----------------

const PREVIEW_KEY = "precisely.measurements.preview";

function previewRead(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PREVIEW_KEY);
function migrate(raw: unknown): Measurement[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): Measurement | null => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const ms = typeof r.ms === "number" ? r.ms : 0;
      const endedAt = typeof r.endedAt === "string" ? r.endedAt : new Date().toISOString();
      const startedAt =
        typeof r.startedAt === "string"
          ? r.startedAt
          : new Date(new Date(endedAt).getTime() - ms).toISOString();
      if (!isValidCategory(r.category)) return null;
      const category = r.category;
      const hidden = typeof r.hidden === "boolean" ? r.hidden : false;
      const id = typeof r.id === "string" ? r.id : newId();
      const comment =
        typeof r.comment === "string" && r.comment.trim() !== "" ? r.comment : undefined;
      return { id, startedAt, endedAt, ms, category, hidden, comment };
    })
    .filter((x): x is Measurement => x !== null);
}

function buildSeed(): Measurement[] {
  const today = new Date();
  const make = (
    startH: number,
    startM: number,
    durMin: number,
    category: Category,
  ): Measurement => {
    const start = new Date(today);
    start.setHours(startH, startM, 0, 0);
    const ms = durMin * 60 * 1000;
    const end = new Date(start.getTime() + ms);
    return {
      id: newId(),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      ms,
      category,
      hidden: false,
    };
  };
  return [
    make(8, 30, 45, "straksafgoerelse"),
    make(9, 20, 60, "straksafgoerelse"),
    make(13, 0, 45, "straksafgoerelse"),
    make(10, 30, 30, "biometri"),
    make(14, 0, 45, "biometri"),
    make(11, 15, 30, "eu_vejledning"),
    make(15, 0, 30, "eu_vejledning"),
  ];
}

function read(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const seeded = window.localStorage.getItem(SEED_KEY);
    if (!raw && !seeded) {
      const seed = buildSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      window.localStorage.setItem(SEED_KEY, "1");
      return seed;
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => m && isValidCategory(m.category)) as Measurement[];
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
function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

const AUTO_DELETE_KEY = "precisely.autoDeleteDays";

function pruneOld(items: Measurement[]): Measurement[] {
  if (typeof window === "undefined") return items;
  let days: number | null = null;
  try {
    const v = window.localStorage.getItem(AUTO_DELETE_KEY);
    if (v && v !== "never") {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) days = n;
    }
  } catch {
    return items;
  }
  if (days === null) return items;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((m) => new Date(m.endedAt).getTime() >= cutoff);
}

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMeasurements(previewRead());
    const initial = read();
    const pruned = pruneOld(initial);
    if (pruned.length !== initial.length) write(pruned);
    setMeasurements(pruned);
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

  const remove = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((m) => m.id !== id));
    },
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

  const removeAllToday = useCallback(() => {
    const today = new Date();
    persist((prev) => prev.filter((m) => m.hidden || !isSameLocalDay(m.endedAt, today)));
  }, [persist]);

  const removeAll = useCallback(() => {
    persist(() => []);
  }, [persist]);


  const visibleToday = useMemo(() => {
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

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const rows = await listFn();
      return rows.map(rowToMeasurement).filter((m): m is Measurement => m !== null);
    },
    enabled,
  });

  const measurements = query.data ?? [];
  const loaded = enabled ? query.isFetched : true;


  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: QUERY_KEY });
  }, [qc]);

  const addMut = useMutation({
    mutationFn: (draft: MeasurementDraft) =>
      createFn({
        data: {
          started_at: draft.startedAt,
          ended_at: draft.endedAt,
          ms: draft.ms,
          category: draft.category,
          comment: draft.comment,
        },
      }),
    onSuccess: invalidate,
  });

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

  const add = useCallback((draft: MeasurementDraft) => addMut.mutate(draft), [addMut]);
  const update = useCallback(
    (id: string, patch: Partial<Omit<Measurement, "id">>) => updateMut.mutate({ id, patch }),
    [updateMut],
  );
  const remove = useCallback((id: string) => deleteMut.mutate(id), [deleteMut]);
  const hide = useCallback((id: string) => updateMut.mutate({ id, patch: { hidden: true } }), [updateMut]);
  const unhide = useCallback(
    (id: string) => updateMut.mutate({ id, patch: { hidden: false } }),
    [updateMut],
  );
  const hideAllToday = useCallback(() => hideRangeMut.mutate(todayBounds()), [hideRangeMut]);
  const removeAllToday = useCallback(() => removeRangeMut.mutate(todayBounds()), [removeRangeMut]);
  const removeAll = useCallback(() => removeAllMut.mutate(), [removeAllMut]);

  return {
    measurements,
    visibleToday,
    hiddenAll,
    loaded,
    add,
    update,
    remove,
    hide,
    unhide,
    hideAllToday,
    removeAllToday,
    removeAll,
  };
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
