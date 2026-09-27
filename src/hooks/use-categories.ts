import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listCategories, type CategoryRow } from "@/lib/categories.functions";
import { getCategoryOrder } from "@/lib/category-order.functions";
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

function applyOrder(
  rows: CategoryRow[],
  order: Category[] | null,
): CategoryRow[] {
  if (!order || order.length === 0) return rows;
  const indexOf = new Map(order.map((v, i) => [v, i] as const));
  return [...rows].sort((a, b) => {
    const ia = indexOf.get(a.value);
    const ib = indexOf.get(b.value);
    if (ia !== undefined && ib !== undefined) return ia - ib;
    if (ia !== undefined) return -1;
    if (ib !== undefined) return 1;
    return a.sort_order - b.sort_order;
  });
}

export const CATEGORY_ORDER_QUERY_KEY = ["category-order"] as const;

export function useCategoryOrder() {
  const fetcher = useServerFn(getCategoryOrder);
  const preview = usePreviewMode();
  return useQuery<{ order: string[] | null }>({
    queryKey: [...CATEGORY_ORDER_QUERY_KEY, preview ? "preview" : "live"],
    queryFn: () => (preview ? Promise.resolve({ order: null }) : fetcher()),
    staleTime: 60 * 1000,
  });
}

export function useInvalidateCategoryOrder() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CATEGORY_ORDER_QUERY_KEY });
}

export function useCategories() {
  const fetcher = useServerFn(listCategories);
  const preview = usePreviewMode();
  const { data: orderData } = useCategoryOrder();
  const order = orderData?.order ?? null;
  const query = useQuery<CategoryRow[]>({
    queryKey: ["categories", preview ? "preview" : "live"],
    queryFn: () => (preview ? Promise.resolve(previewCategories()) : fetcher()),
    staleTime: 60 * 1000,
  });
  return {
    ...query,
    data: query.data ? applyOrder(query.data, order) : query.data,
  };
}

export function useCategoryLabel(value: Category | undefined | null): string {
  const { data } = useCategories();
  if (!value) return "";
  const found = data?.find((c) => c.value === value);
  return found?.label ?? fallbackCategoryLabel(value);
}

// Legacy: clear local cached order from older versions so it doesn't override DB.
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem("precisely.categoryOrder");
    window.localStorage.removeItem("precisely.activeCategories");
    window.localStorage.removeItem("precisely.lastCategory");
  } catch {
    // ignore
  }
}
