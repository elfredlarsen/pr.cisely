import { useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";

import { TopNav } from "@/components/stopwatch/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCategories } from "@/hooks/use-categories";
import { useMyRoleInfo } from "@/hooks/use-my-role";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryRow,
} from "@/lib/categories.functions";

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
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
          <Skeleton className="h-8 w-40" />
          <div className="mt-6 space-y-2">
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <h1 className="sr-only">Administrator</h1>

        <section
          aria-labelledby="kategorier-admin-heading"
          className="mx-auto w-full max-w-xl rounded-lg border border-border bg-card p-6"
        >
          <header className="mb-6 text-center">
            <h2 id="kategorier-admin-heading" className="text-lg font-semibold">
              Kategorier
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Omdøb eller slet kategorier. Historiske registreringer berøres ikke.
            </p>
          </header>

          <div>
            <CategoriesAdminList />
            <AddCategoryForm />
          </div>
        </section>

      </main>
    </div>
  );
}

function CategoriesAdminList() {
  const { data: categories, isLoading } = useCategories();
  const listRef = useRef<HTMLUListElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const sorted = [...(categories ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollUp(el.scrollTop > 0);
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sorted.length]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <p className="rounded-md border border-border p-4 text-center text-sm text-muted-foreground">
        Ingen kategorier endnu. Tilføj den første nedenfor.
      </p>
    );
  }

  return (
    <div className="relative">
      <ul
        ref={listRef}
        className="scrollbar-purple max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border"
      >
        {sorted.map((c) => (
          <CategoryAdminRow key={c.id} row={c} />
        ))}
      </ul>
      {canScrollUp && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-md bg-gradient-to-b from-card to-transparent"
        />
      )}
      {canScrollDown && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-md bg-gradient-to-t from-card to-transparent"
        />
      )}
    </div>
  );
}

function CategoryAdminRow({ row }: { row: CategoryRow }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(row.label);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const update = useServerFn(updateCategory);
  const remove = useServerFn(deleteCategory);

  const commit = async () => {
    const trimmed = label.trim();
    if (!trimmed || trimmed === row.label) {
      setLabel(row.label);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await update({ data: { id: row.id, label: trimmed } });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Navn opdateret");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke gemme");
      setLabel(row.label);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove({ data: { id: row.id } });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Kategori slettet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke slette");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="flex min-h-11 items-center justify-between gap-4 px-4 py-2">
      {editing ? (
        <Input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") {
              setLabel(row.label);
              setEditing(false);
            }
          }}
          disabled={saving}
          maxLength={80}
          className="h-8 flex-1"
          aria-label={`Navn for kategorien ${row.value}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 cursor-text truncate text-left text-sm font-normal"
          aria-label={`Rediger ${row.label}`}
        >
          {row.label}
        </button>
      )}
      <div className="flex shrink-0 items-center gap-1">
        {!editing && (
          <IconTooltip label="Omdøb kategori">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setEditing(true)}
              disabled={saving || deleting}
              className="h-8 w-14 text-muted-foreground"
              aria-label={`Omdøb ${row.label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </IconTooltip>
        )}
        <AlertDialog>
          <IconTooltip label="Slet kategori">
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-11 text-muted-foreground hover:text-destructive"
                disabled={saving || deleting || editing}
                aria-label={`Slet ${row.label}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
          </IconTooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Slet kategorien "{row.label}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Historiske registreringer berøres ikke. Kategorien forsvinder blot
                fra dropdowns ved nye registreringer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuller</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Slet
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

function AddCategoryForm() {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const create = useServerFn(createCategory);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await create({ data: { label: trimmed } });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setLabel("");
      toast.success("Kategori tilføjet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke tilføje");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 flex items-center gap-2 border-t border-border pt-4"
    >
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Navn på ny kategori"
        maxLength={80}
        disabled={saving}
        aria-label="Navn på ny kategori"
        className="h-9 flex-1"
      />
      <Button type="submit" size="sm" disabled={saving || !label.trim()}>
        <Plus className="mr-1 h-4 w-4" />
        Tilføj
      </Button>
    </form>
  );
}
