import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getLastCategory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ last: string | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("last_category_id")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[last-category.get]", error);
      throw new Error("Databasefejl. Prøv igen.");
    }
    const id = data?.last_category_id;
    if (!id) return { last: null };
    const { data: cat } = await supabase
      .from("categories")
      .select("value")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    return { last: cat?.value ?? null };
  });

export const setLastCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ value: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("value", data.value)
      .maybeSingle();
    if (catErr || !cat) {
      console.error("[last-category.set] category lookup", catErr);
      throw new Error("Kategorien findes ikke.");
    }
    const { error } = await supabase
      .from("profiles")
      .update({ last_category_id: cat.id })
      .eq("id", userId);
    if (error) {
      console.error("[last-category.set]", error);
      throw new Error("Databasefejl. Prøv igen.");
    }
    return { ok: true };
  });
