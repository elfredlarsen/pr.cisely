import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listCategories, type CategoryRow } from "@/lib/categories.functions";
import {
  CATEGORY_ORDER_EVENT,
  CATEGORY_ORDER_KEY,
  FALLBACK_CATEGORY_LABELS,
  fallbackCategoryLabel,
  getCategoryOrder,
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

function useCategoryOrder(): Category[] | null {
  const [order, setOrder] = useState<Category[] | null>(() => getCategoryOrder());
  useEffect(() => {
    const sync = () => setOrder(getCategoryOrder());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CATEGORY_ORDER_KEY) sync();
    };
    window.addEventListener(CATEGORY_ORDER_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CATEGORY_ORDER_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return order;
}

export function useCategories() {
  const fetcher = useServerFn(listCategories);
  const preview = usePreviewMode();
  const order = useCategoryOrder();
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
