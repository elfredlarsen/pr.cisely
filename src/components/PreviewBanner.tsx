import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { disablePreview, usePreviewMode } from "@/lib/preview-mode";

export function PreviewBanner() {
  const on = usePreviewMode();
  if (!on) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-xs text-amber-200">
      <span className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        <strong>Preview-tilstand</strong>
        <span className="text-amber-200/80">
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
        className="h-7 px-2 text-xs text-amber-100 hover:bg-amber-500/25 hover:text-amber-50"
      >
        Afslut preview
      </Button>
    </div>
  );
}
