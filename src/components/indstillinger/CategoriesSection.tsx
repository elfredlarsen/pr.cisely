import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryLabelEditor } from "@/components/indstillinger/CategoryEditing";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { type Category } from "@/lib/categories";
import { useCategories, useInvalidateCategories } from "@/hooks/use-categories";
import {
  setCategoryOrder as setCategoryOrderFn,
  setActiveCategories as setActiveCategoriesFn,
  createCategory as createCategoryFn,
} from "@/lib/categories.functions";

function AddCategoryForm() {
  const create = useServerFn(createCategoryFn);
  const invalidate = useInvalidateCategories();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = label.trim();
    if (!name) {
      toast.error("Skriv et navn til kategorien.");
      return;
    }
    setBusy(true);
    try {
      await create({ data: { label: name } });
      await invalidate();
      setLabel("");
      toast.success("Kategori tilføjet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke tilføje kategori.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <label htmlFor="ny-kategori" className="sr-only">Ny kategori</label>
      <Input
        id="ny-kategori"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Ny kategori"
        maxLength={80}
        className="min-h-11 flex-1"
      />
      <Button type="submit" disabled={busy} className="min-h-11 px-5 font-semibold">
        Tilføj
      </Button>
    </form>
  );
}

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();
  const visible = categories ?? [];

  const saveActive = useServerFn(setActiveCategoriesFn);
  const invalidateActive = useInvalidateCategories();

  const [filter, setFilter] = useState<Set<Category> | null>(null);
  const didMountRef = useRef(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const isActive = (value: Category) =>
    filter === null ? true : filter.has(value);

  const activeCount =
    filter === null ? visible.length : visible.filter((c) => filter.has(c.value)).length;

  useEffect(() => {
    const rows = categories ?? [];
    setFilter(
      rows.some((r) => r.hidden)
        ? new Set(rows.filter((r) => !r.hidden).map((r) => r.value))
        : null,
    );
  }, [categories]);

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
  }, [visible.length]);

  const toggle = async (value: Category, next: boolean) => {
    const current = filter ?? new Set(visible.map((c) => c.value));
    const updated = new Set(current);
    if (next) updated.add(value);
    else updated.delete(value);

    const ordered = visible.map((c) => c.value).filter((v) => updated.has(v));
    const previous = filter;
    setFilter(updated);

    try {
      await saveActive({
        data: { active: ordered.length === visible.length ? null : ordered },
      });
      await invalidateActive();
      if (didMountRef.current) {
        toast.success("Kategorier opdateret");
      } else {
        didMountRef.current = true;
      }
    } catch {
      setFilter(previous);
      toast.error("Kunne ikke gemme kategorier");
    }
  };

  const saveOrder = useServerFn(setCategoryOrderFn);
  const invalidateOrder = useInvalidateCategories();

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= visible.length) return;
    const next = visible.map((c) => c.value);
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await saveOrder({ data: { order: next } });
      await invalidateOrder();
      toast.success("Rækkefølge opdateret");
    } catch {
      toast.error("Kunne ikke gemme rækkefølge");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
    <AddCategoryForm />
    <div className="relative">
      <ul
        ref={listRef}
        className="scrollbar-purple max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border"
      >
        {visible.map((c, i) => {
          const active = isActive(c.value);
          const isLastActive = active && activeCount === 1;
          const id = `category-toggle-${c.value}`;
          return (
            <li
              key={c.value}
              className="flex min-h-11 items-center justify-between gap-2 px-3 py-2"
            >
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Flyt ${c.label} op`}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => move(i, 1)}
                  disabled={i === visible.length - 1}
                  aria-label={`Flyt ${c.label} ned`}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <CategoryLabelEditor row={c} htmlFor={id} />
              <Switch
                id={id}
                checked={active}
                disabled={isLastActive}
                onCheckedChange={(v) => toggle(c.value, v)}
                aria-label={`Aktivér ${c.label}`}
              />
            </li>
          );
        })}
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
    </div>
  );
}
