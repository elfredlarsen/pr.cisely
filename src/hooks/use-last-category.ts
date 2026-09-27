import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  getLastCategory,
  setLastCategory,
} from "@/lib/last-category.functions";
import { usePreviewMode } from "@/lib/preview-mode";

const KEY = ["last-category"] as const;

export function useLastCategory(): string | null {
  const fetcher = useServerFn(getLastCategory);
  const preview = usePreviewMode();
  const { data } = useQuery({
    queryKey: [...KEY, preview ? "preview" : "live"],
    queryFn: () => (preview ? Promise.resolve({ last: null }) : fetcher()),
    staleTime: 60 * 1000,
  });
  return data?.last ?? null;
}

export function useSaveLastCategory() {
  const save = useServerFn(setLastCategory);
  const preview = usePreviewMode();
  const qc = useQueryClient();
  return (value: string) => {
    qc.setQueriesData({ queryKey: KEY }, { last: value });
    if (preview) return;
    save({ data: { value } }).catch(() => {});
  };
}
