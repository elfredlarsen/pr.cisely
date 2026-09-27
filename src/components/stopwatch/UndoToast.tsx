import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = { id: string | number; onUndo: () => void; duration?: number };

/** Toast that stays open while hovered or focused; timer restarts on leave. */
export function UndoToast({ id, onUndo, duration = 5000 }: Props) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const held = hovered || focused;

  useEffect(() => {
    if (held) return;
    const t = window.setTimeout(() => toast.dismiss(id), duration);
    return () => window.clearTimeout(t);
  }, [held, id, duration]);

  return (
    <div
      ref={ref}
      role="status"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="flex w-[356px] max-w-full items-center justify-between gap-3 rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg"
    >
      <span>Stopuret er nulstillet</span>
      <button
        type="button"
        onClick={() => {
          onUndo();
          toast.dismiss(id);
        }}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Fortryd
      </button>
    </div>
  );
}
