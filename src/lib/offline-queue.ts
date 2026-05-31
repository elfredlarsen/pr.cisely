// Lokal kø af målinger der ikke nåede serveren.
// Bruges af useMeasurements til offline-tolerance: når createMeasurement
// fejler pga. manglende netforbindelse, lægges målingen her og synkroniseres
// automatisk når browseren rapporterer online igen.

import { useEffect, useState } from "react";

import type { MeasurementDraft } from "@/hooks/use-measurements";

const KEY = "precisely.offline-queue.v1";
const EVENT = "precisely:offline-queue-changed";
const MAX_QUEUE = 200;

// Backoff i ms ved gentagne fejl (efter index 3 bruges sidste værdi).
const BACKOFF_MS = [0, 5_000, 15_000, 60_000, 300_000];

export const TEMP_ID_PREFIX = "tmp-";

export type QueuedDraft = {
  tempId: string;
  draft: MeasurementDraft;
  queuedAt: number;
  attempts: number;
  nextAttemptAt: number;
  lastError?: string;
};

function newTempId() {
  return `${TEMP_ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(): QueuedDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (q): q is QueuedDraft =>
        q &&
        typeof q === "object" &&
        typeof q.tempId === "string" &&
        q.draft &&
        typeof q.draft.startedAt === "string" &&
        typeof q.draft.endedAt === "string" &&
        typeof q.draft.ms === "number" &&
        typeof q.draft.category === "string",
    );
  } catch {
    return [];
  }
}

function write(items: QueuedDraft[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage kvote sprængt eller blokeret — ignorer stille
  }
}


export function enqueueDraft(draft: MeasurementDraft): QueuedDraft | null {
  const current = read();
  if (current.length >= MAX_QUEUE) {
    console.warn("[offline-queue] kø er fuld — afviser nye poster");
    return null;
  }
  const item: QueuedDraft = {
    tempId: newTempId(),
    draft,
    queuedAt: Date.now(),
    attempts: 0,
    nextAttemptAt: Date.now(),
  };
  write([...current, item]);
  return item;
}

export function dequeueDraft(tempId: string) {
  const current = read();
  const next = current.filter((q) => q.tempId !== tempId);
  if (next.length !== current.length) write(next);
}

export function markAttempt(tempId: string, error?: string) {
  const current = read();
  const next = current.map((q) => {
    if (q.tempId !== tempId) return q;
    const attempts = q.attempts + 1;
    const delayIdx = Math.min(attempts, BACKOFF_MS.length - 1);
    return {
      ...q,
      attempts,
      nextAttemptAt: Date.now() + BACKOFF_MS[delayIdx],
      lastError: error,
    };
  });
  write(next);
}

function subscribeQueue(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) handler();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

/** React-hook: returnerer en altid-frisk snapshot af køen. */
export function useOfflineQueue(): QueuedDraft[] {
  const [items, setItems] = useState<QueuedDraft[]>(() => read());

  useEffect(() => {
    setItems(read());
    return subscribeQueue(() => setItems(read()));
  }, []);

  return items;
}
