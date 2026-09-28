import { useCategories } from "@/hooks/use-categories";
import { type Category } from "@/lib/categories";

/** `null` = alle kategorier er aktive; ellers værdierne for ikke-skjulte kategorier. */
export function useActiveCategoriesFilter(): Category[] | null {
  const { data } = useCategories();
  const rows = data ?? [];
  if (!rows.some((r) => r.hidden)) return null;
  return rows.filter((r) => !r.hidden).map((r) => r.value);
}
