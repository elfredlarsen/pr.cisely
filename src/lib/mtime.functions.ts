import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const dayRe = /^\d{4}-\d{2}-\d{2}$/;

/** Returnerer kategori-værdier markeret som indtastet i mTime for en dag. */
export const listMtimeEntered = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ day: z.string().regex(dayRe) }).parse(input))
  .handler(async ({ data, context }): Promise<string[]> => {
    const { data: rows, error } = await context.supabase
      .from("mtime_entries")
      .select("categories(value)")
      .eq("user_id", context.userId)
      .eq("day", data.day);
    if (error) {
      console.error("[mtime.list]", error);
      throw new Error("Databasefejl. Prøv igen.");
    }
    return (rows ?? [])
      .map((r) => (r as { categories: { value: string } | null }).categories?.value)
      .filter((v): v is string => !!v);
  });

export const setMtimeEntered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ day: z.string().regex(dayRe), value: z.string().min(1).max(80), entered: z.boolean() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("value", data.value)
      .maybeSingle();
    if (catErr || !cat) throw new Error("Kategorien findes ikke.");
    const { error } = data.entered
      ? await supabase
          .from("mtime_entries")
          .upsert({ user_id: userId, category_id: cat.id, day: data.day }, { ignoreDuplicates: true })
      : await supabase
          .from("mtime_entries")
          .delete()
          .eq("user_id", userId)
          .eq("category_id", cat.id)
          .eq("day", data.day);
    if (error) {
      console.error("[mtime.set]", error);
      throw new Error("Kunne ikke gemme. Prøv igen.");
    }
    return { ok: true };
  });
