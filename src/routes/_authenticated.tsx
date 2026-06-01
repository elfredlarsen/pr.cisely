import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";

import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { usePreviewMode } from "@/lib/preview-mode";
import { PreviewBanner } from "@/components/PreviewBanner";
import { StopwatchProvider } from "@/components/stopwatch/StopwatchContext";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { status } = useSupabaseSession();
  const preview = usePreviewMode();

  if (status === "loading" && !preview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Indlæser...</div>
      </div>
    );
  }

  if (status === "unauthenticated" && !preview) {
    return <Navigate to="/login" replace />;
  }

  return (
    <StopwatchProvider>
      <PreviewBanner />
      <Outlet />
    </StopwatchProvider>
  );
}

