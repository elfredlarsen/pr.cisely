export type SummaryFormat = "decimal" | "hm";

export function formatTotal(ms: number, fmt: SummaryFormat): string {
  if (fmt === "decimal") {
    return `${(ms / 3600000).toFixed(2).replace(".", ",")} t`;
  }
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} t`;
  return `${h} t ${m} min`;
}

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fmtDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function parseTime(value: string, base: Date): Date | null {
  if (value.trim() === "") {
    const d = new Date(base);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  const d = new Date(base);
  d.setHours(h, mi, s, 0);
  return d;
}

export function parseDuration(value: string): number | null {
  if (value.trim() === "") return 0;
  const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if (h > 23 || mi > 59 || s > 59) return null;
  return (h * 3600 + mi * 60 + s) * 1000;
}

export function maskDuration(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 7);
  if (digits.length === 0) return "";
  const h = digits.slice(0, Math.max(1, digits.length - 4));
  const rest = digits.slice(h.length);
  const m = rest.slice(0, 2);
  const s = rest.slice(2, 4);
  let result = h;
  if (rest.length > 0) result += ":" + m;
  if (rest.length > 2) result += ":" + s;
  return result;
}
