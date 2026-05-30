import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    // Re-read on mount in case localStorage was hydrated after first render
    setActive(new Set(getActiveCategories()));
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
    <ul className="scrollbar-purple max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border">
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
  );
}
