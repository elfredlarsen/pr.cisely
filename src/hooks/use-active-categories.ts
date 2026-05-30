import { useEffect, useState } from "react";
import {
  ACTIVE_CATEGORIES_EVENT,
  ACTIVE_CATEGORIES_KEY,
  getActiveCategoriesFilter,
  type Category,
} from "@/lib/categories";

/**
 * Returnerer per-bruger filter (`null` = alle kategorier vises).
 */
export function useActiveCategoriesFilter(): Category[] | null {
  const [active, setActive] = useState<Category[] | null>(() =>
    getActiveCategoriesFilter(),
  );

  useEffect(() => {
    const sync = () => setActive(getActiveCategoriesFilter());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVE_CATEGORIES_KEY) sync();
    };
    window.addEventListener(ACTIVE_CATEGORIES_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ACTIVE_CATEGORIES_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return active;
}
