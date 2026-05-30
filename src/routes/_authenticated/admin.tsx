import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { TopNav } from "@/components/stopwatch/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { useMyRoleInfo } from "@/hooks/use-my-role";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { updateCategory, type CategoryRow } from "@/lib/categories.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administrator · pr:cisely" },
      { name: "description", content: "Administrer kategorier." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { status } = useSupabaseSession();
  const role = useMyRoleInfo(status === "authenticated");

  if (status === "loading" || role.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopNav />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
          <Skeleton className="h-8 w-40" />
          <div className="mt-6 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!role.data?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminContent />;
}

function AdminContent() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Administrator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Omdøb kategorier eller skjul dem fra dropdowns. Historiske registreringer bevarer deres kategori.
          </p>
        </header>

        <section
          aria-labelledby="kategorier-admin"
          className="rounded-lg border border-border bg-card p-6"
        >
          <h2 id="kategorier-admin" className="text-base font-semibold">
            Kategorier
          </h2>
          <CategoriesAdminList />
        </section>
      </main>
    </div>
  );
}

function CategoriesAdminList() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const sorted = [...(categories ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ul className="mt-4 divide-y divide-border rounded-md border border-border">
      {sorted.map((c) => (
        <CategoryAdminRow key={c.id} row={c} />
      ))}
    </ul>
  );
}

function CategoryAdminRow({ row }: { row: CategoryRow }) {
  const [label, setLabel] = useState(row.label);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const update = useServerFn(updateCategory);
  const dirty = label.trim() !== row.label && label.trim().length > 0;

  const saveLabel = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await update({ data: { id: row.id, label: label.trim() } });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Navn opdateret");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke gemme");
      setLabel(row.label);
    } finally {
      setSaving(false);
    }
  };

  const toggleHidden = async (next: boolean) => {
    setSaving(true);
    try {
      await update({ data: { id: row.id, hidden: next } });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(next ? "Kategori skjult" : "Kategori vist");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke gemme");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {row.hidden ? (
          <EyeOff
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-label="Skjult"
          />
        ) : (
          <Eye className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Synlig" />
        )}
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={saveLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") {
              setLabel(row.label);
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={saving}
          className="h-9 max-w-sm"
          aria-label={`Navn for kategorien ${row.value}`}
        />
        {dirty && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={saveLabel}
            disabled={saving}
          >
            Gem
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {row.hidden ? "Skjult" : "Synlig"}
        </span>
        <Switch
          checked={!row.hidden}
          onCheckedChange={(v) => toggleHidden(!v)}
          disabled={saving}
          aria-label="Synlig"
        />
      </div>
    </li>
  );
}
