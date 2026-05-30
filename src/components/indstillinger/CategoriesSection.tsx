import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getActiveCategoriesFilter,
  setActiveCategoriesFilter,
  type Category,
} from "@/lib/categories";
import { useCategories } from "@/hooks/use-categories";

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();
  const visible = categories ?? [];


  // active er sættet af kategorier brugeren vil have vist; null = alle (afledt fra synlige)
  const [filter, setFilter] = useState<Set<Category> | null>(() => {
    const v = getActiveCategoriesFilter();
    return v ? new Set(v) : null;
  });
  const didMountRef = useRef(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Hvis filter er null (=alle), behandl alle synlige som aktive
  const isActive = (value: Category) =>
    filter === null ? true : filter.has(value);

  const activeCount = filter === null ? visible.length : visible.filter((c) => filter.has(c.value)).length;

  useEffect(() => {
    const v = getActiveCategoriesFilter();
    setFilter(v ? new Set(v) : null);
  }, []);

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

  const toggle = (value: Category, next: boolean) => {
    const current = filter ?? new Set(visible.map((c) => c.value));
    const updated = new Set(current);
    if (next) updated.add(value);
    else updated.delete(value);

    // Keep order matching the visible sort order
    const ordered = visible.map((c) => c.value).filter((v) => updated.has(v));
    setActiveCategoriesFilter(ordered);
    setFilter(updated);

    if (didMountRef.current) {
      toast.success("Kategorier opdateret");
    } else {
      didMountRef.current = true;
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
    <div className="relative">
      <ul
        ref={listRef}
        className="scrollbar-purple max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border"
      >
        {visible.map((c) => {
          const active = isActive(c.value);
          const isLastActive = active && activeCount === 1;
          const id = `category-toggle-${c.value}`;
          return (
            <li
              key={c.value}
              className="flex min-h-11 items-center justify-between gap-4 px-4 py-2"
            >
              <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
                {c.label}
              </Label>
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
  );
}
