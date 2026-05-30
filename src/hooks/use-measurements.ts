import { useCallback, useEffect, useMemo, useState } from "react";
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

const STORAGE_KEY = "precisely.measurements";
const SEED_KEY = "precisely.measurements.seeded";

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

  useEffect(() => {
    const initial = read();
    const pruned = pruneOld(initial);
    if (pruned.length !== initial.length) write(pruned);
    setMeasurements(pruned);
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
          comment: draft.comment,
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

  const remove = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((m) => m.id !== id));
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

  const removeAllToday = useCallback(() => {
    const today = new Date();
    persist((prev) => prev.filter((m) => m.hidden || !isSameLocalDay(m.endedAt, today)));
  }, [persist]);

  const removeAll = useCallback(() => {
    persist(() => []);
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
    remove,
    hide,
    unhide,
    hideAllToday,
    removeAllToday,
    removeAll,
  };
}

export { isSameLocalDay };
