import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listCategories, type CategoryRow } from "@/lib/categories.functions";
import { fallbackCategoryLabel, type Category } from "@/lib/categories";

export function useCategories() {
  const fetcher = useServerFn(listCategories);
  return useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: () => fetcher(),
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
