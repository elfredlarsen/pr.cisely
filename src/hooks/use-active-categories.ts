import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getActiveCategories } from "@/lib/active-categories.functions";
import { type Category } from "@/lib/categories";
import { usePreviewMode } from "@/lib/preview-mode";

export const ACTIVE_CATEGORIES_QUERY_KEY = ["active-categories"] as const;

/**
 * Returnerer per-bruger filter fra databasen (`null` = alle kategorier vises).
 * I preview-tilstand bruges det lokale fallback-filter.
 */
export function useActiveCategoriesQuery() {
  const fetcher = useServerFn(getActiveCategories);
  const preview = usePreviewMode();
  return useQuery<{ active: string[] | null }>({
    queryKey: [...ACTIVE_CATEGORIES_QUERY_KEY, preview ? "preview" : "live"],
    queryFn: () =>
      preview
        ? Promise.resolve({ active: null })
        : fetcher(),
    staleTime: 60 * 1000,
  });
}

export function useInvalidateActiveCategories() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ACTIVE_CATEGORIES_QUERY_KEY });
}

export function useActiveCategoriesFilter(): Category[] | null {
  const { data } = useActiveCategoriesQuery();
  return data?.active ?? null;
}
