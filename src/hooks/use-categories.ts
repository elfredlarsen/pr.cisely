import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listCategories, type CategoryRow } from "@/lib/categories.functions";
import {
  FALLBACK_CATEGORY_LABELS,
  fallbackCategoryLabel,
  type Category,
} from "@/lib/categories";
import { usePreviewMode } from "@/lib/preview-mode";

function previewCategories(): CategoryRow[] {
  return Object.entries(FALLBACK_CATEGORY_LABELS).map(([value, label], i) => ({
    id: `preview-${value}`,
    value,
    label,
    sort_order: i,
    hidden: false,
  }));
}

export function useCategories() {
  const fetcher = useServerFn(listCategories);
  const preview = usePreviewMode();
  return useQuery<CategoryRow[]>({
    queryKey: ["categories", preview ? "preview" : "live"],
    queryFn: () => (preview ? Promise.resolve(previewCategories()) : fetcher()),
    staleTime: 60 * 1000,
  });
}

export function useVisibleCategories() {
  const q = useCategories();
  return {
    ...q,
    data: q.data ?? [],
  };
}


export function useCategoryLabel(value: Category | undefined | null): string {
  const { data } = useCategories();
  if (!value) return "";
  const found = data?.find((c) => c.value === value);
  return found?.label ?? fallbackCategoryLabel(value);
}
