import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/categories";

export type Measurement = {
  id: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  ms: number;
  category: Category;
  hidden: boolean;
};

export type MeasurementDraft = {
  startedAt: string;
  endedAt: string;
  ms: number;
  category: Category;
};

const STORAGE_KEY = "precisely.measurements";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

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
      const category = (typeof r.category === "string" ? r.category : "andet") as Category;
      const hidden = typeof r.hidden === "boolean" ? r.hidden : false;
      const id = typeof r.id === "string" ? r.id : newId();
      return { id, startedAt, endedAt, ms, category, hidden };
    })
    .filter((x): x is Measurement => x !== null);
}

function read(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return migrate(JSON.parse(raw));
  } catch {
    return [];
  }
}

function write(items: Measurement[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    setMeasurements(read());
  }, []);

  const persist = useCallback((updater: (prev: Measurement[]) => Measurement[]) => {
    setMeasurements((prev) => {
      const next = updater(prev);
      write(next);
      return next;
    });
  }, []);

  const add = useCallback(
    (draft: MeasurementDraft) => {
      persist((prev) => [
        {
          id: newId(),
          startedAt: draft.startedAt,
          endedAt: draft.endedAt,
          ms: draft.ms,
          category: draft.category,
          hidden: false,
        },
        ...prev,
      ]);
    },
    [persist],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<Measurement, "id">>) => {
      persist((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [persist],
  );

  const hide = useCallback(
    (id: string) => {
      persist((prev) => prev.map((m) => (m.id === id ? { ...m, hidden: true } : m)));
    },
    [persist],
  );

  const unhide = useCallback(
    (id: string) => {
      persist((prev) => prev.map((m) => (m.id === id ? { ...m, hidden: false } : m)));
    },
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

  const visibleToday = useMemo(() => {
    const today = new Date();
    return measurements.filter((m) => !m.hidden && isSameLocalDay(m.endedAt, today));
  }, [measurements]);

  const hiddenAll = useMemo(
    () => measurements.filter((m) => m.hidden),
    [measurements],
  );

  return {
    measurements,
    visibleToday,
    hiddenAll,
    add,
    update,
    hide,
    unhide,
    hideAllToday,
  };
}
