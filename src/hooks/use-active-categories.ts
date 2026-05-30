import { useEffect, useState } from "react";
import {
  ACTIVE_CATEGORIES_EVENT,
  ACTIVE_CATEGORIES_KEY,
  getActiveCategories,
  type Category,
} from "@/lib/categories";

export function useActiveCategories(): Category[] {
  const [active, setActive] = useState<Category[]>(() => getActiveCategories());

  useEffect(() => {
    const sync = () => setActive(getActiveCategories());
    // Initial sync (covers SSR mismatch)
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
