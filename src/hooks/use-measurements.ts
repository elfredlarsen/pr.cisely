import { useCallback, useEffect, useState } from "react";

export type Measurement = {
  id: string;
  ms: number;
  endedAt: string;
};

const STORAGE_KEY = "precisely.measurements";

function read(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    setMeasurements(read());
  }, []);

  const add = useCallback((ms: number) => {
    setMeasurements((prev) => {
      const next: Measurement[] = [
        {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,
          ms,
          endedAt: new Date().toISOString(),
        },
        ...prev,
      ];
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setMeasurements([]);
  }, []);

  return { measurements, add, clear };
}
