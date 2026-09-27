import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryRow,
} from "@/lib/categories.functions";

export function CategoryLabelEditor({
  row,
  htmlFor,
}: {
  row: CategoryRow;
  htmlFor: string;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(row.label);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const update = useServerFn(updateCategory);
  const remove = useServerFn(deleteCategory);

  const commit = async () => {
    const trimmed = label.trim();
    if (!trimmed || trimmed === row.label) {
      setLabel(row.label);
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await update({ data: { id: row.id, label: trimmed } });
      await qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Navn opdateret");
    } catch {
      setLabel(row.label);
      toast.error("Kunne ikke gemme navnet");
    } finally {
      setBusy(false);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await remove({ data: { id: row.id } });
      await qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Kategori slettet");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.startsWith("Kategorien bruges") ? msg : "Kunne ikke slette kategorien");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 items-center gap-1 min-w-0">
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
          disabled={busy}
          maxLength={80}
          className="h-8 flex-1"
          aria-label={`Navn for ${row.label}`}
        />
      ) : (
        <label htmlFor={htmlFor} className="flex-1 cursor-pointer truncate text-sm">
          {row.label}
        </label>
      )}
      {!editing && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => setEditing(true)}
          disabled={busy}
          aria-label={`Omdøb ${row.label}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            disabled={busy || editing}
            aria-label={`Slet ${row.label}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet kategorien "{row.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Dine gamle registreringer bevares, men viser kategoriens interne navn.
              Vil du blot skjule den, så slå den fra i stedet.
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
  );
}

export function AddCategoryForm() {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const create = useServerFn(createCategory);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await create({ data: { label: trimmed } });
      await qc.invalidateQueries({ queryKey: ["categories"] });
      setLabel("");
      toast.success("Kategori tilføjet");
    } catch {
      toast.error("Kunne ikke tilføje kategorien");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 flex items-center gap-2">
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
