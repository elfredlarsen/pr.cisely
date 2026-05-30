import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CATEGORIES,
  getActiveCategories,
  setActiveCategories,
  type Category,
} from "@/lib/categories";

export function CategoriesSection() {
  const [active, setActive] = useState<Set<Category>>(
    () => new Set(getActiveCategories()),
  );
  const didMountRef = useRef(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    setActive(new Set(getActiveCategories()));
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
  }, []);

  const toggle = (value: Category, next: boolean) => {
    setActive((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(value);
      else updated.delete(value);

      const ordered = CATEGORIES.map((c) => c.value).filter((v) => updated.has(v));
      setActiveCategories(ordered);

      if (didMountRef.current) {
        toast.success("Kategorier opdateret");
      } else {
        didMountRef.current = true;
      }
      return updated;
    });
  };

  return (
    <div className="relative">
      <ul
        ref={listRef}
        className="scrollbar-purple max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border"
      >
        {CATEGORIES.map((c) => {
          const isActive = active.has(c.value);
          const isLastActive = isActive && active.size === 1;
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
                checked={isActive}
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
          className="pointer-events-none absolute inset-x-0 top-0 h-6 rounded-t-md bg-gradient-to-b from-card to-transparent"
        />
      )}
      {canScrollDown && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-md bg-gradient-to-t from-card to-transparent"
        />
      )}
    </div>
  );
}
