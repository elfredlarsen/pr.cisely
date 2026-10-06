import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { listMtimeEntered, setMtimeEntered } from "@/lib/mtime.functions";
import { usePreviewMode } from "@/lib/preview-mode";

function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function useMtimeEntered(date: Date) {
  const day = dayKey(date);
  const preview = usePreviewMode();
  const list = useServerFn(listMtimeEntered);
  const set = useServerFn(setMtimeEntered);
  const qc = useQueryClient();
  const key = ["mtime", preview ? "preview" : "live", day];

  const query = useQuery<string[]>({
    queryKey: key,
    queryFn: () => (preview ? Promise.resolve([]) : list({ data: { day } })),
  });

  const mutation = useMutation({
    mutationFn: async (v: { value: string; entered: boolean }) => {
      if (!preview) await set({ data: { day, ...v } });
    },
    onMutate: async ({ value, entered }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<string[]>(key) ?? [];
      qc.setQueryData<string[]>(
        key,
        entered ? [...new Set([...prev, value])] : prev.filter((x) => x !== value),
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx) qc.setQueryData(key, ctx.prev);
      toast.error(e instanceof Error ? e.message : "Kunne ikke gemme");
    },
  });

  return {
    entered: new Set(query.data ?? []),
    toggle: (value: string, entered: boolean) => mutation.mutate({ value, entered }),
  };
}
