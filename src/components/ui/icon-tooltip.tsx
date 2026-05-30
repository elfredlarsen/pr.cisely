import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  label: ReactNode;
  children: ReactNode;
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
};

export function IconTooltip({
  label,
  children,
  shortcut,
  side = "top",
  delayDuration = 400,
}: Props) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          className="flex items-center gap-1.5 rounded border border-border/30 bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground shadow-none backdrop-blur-sm"
        >
          <span>{label}</span>
          {shortcut && (
            <kbd className="rounded border border-border/30 bg-muted/40 px-1 py-0 font-mono text-[10px] text-muted-foreground/70">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
