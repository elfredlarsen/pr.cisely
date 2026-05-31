import { CloudOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { IconTooltip } from "@/components/ui/icon-tooltip";
import { useOfflineQueue } from "@/lib/offline-queue";
import { cn } from "@/lib/utils";

function useOnline() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

/**
 * Lille indikator i top-nav der viser status for offline-køen.
 * - Skjult når alt er online og køen er tom.
 * - Gul prik + tæller når noget venter på synk.
 * - Rød prik når browseren er offline.
 */
export function SyncStatus() {
  const queue = useOfflineQueue();
  const online = useOnline();
  const count = queue.length;

  if (online && count === 0) return null;

  const label = !online
    ? count > 0
      ? `Offline · ${count} venter på synk`
      : "Offline"
    : `${count} venter på synk`;

  const Icon = online ? RefreshCw : CloudOff;
  const dotClass = online ? "bg-amber-500" : "bg-rose-500";

  return (
    <IconTooltip label={label}>
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground",
        )}
      >
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotClass)}
          aria-hidden="true"
        />
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </span>
    </IconTooltip>
  );
}
