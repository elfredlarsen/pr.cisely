import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { disablePreview, usePreviewMode } from "@/lib/preview-mode";

export function PreviewBanner() {
  const on = usePreviewMode();
  if (!on) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-warning bg-warning/20 px-4 py-1.5 text-xs text-foreground">
      <span className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        <strong>Preview-tilstand</strong>
        <span className="text-muted-foreground">
          — UI-test uden login. Data kommer fra browserens lokale lager.
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          disablePreview();
          window.location.href = "/login";
        }}
        className="h-7 px-2 text-xs text-foreground hover:bg-warning/30"
      >
        Afslut preview
      </Button>
    </div>
  );
}
