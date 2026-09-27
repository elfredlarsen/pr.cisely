import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getLastCategory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ last: string | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("last_category")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[last-category.get]", error);
      throw new Error("Databasefejl. Prøv igen.");
    }
    return { last: data?.last_category ?? null };
  });

export const setLastCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ value: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ last_category: data.value })
      .eq("id", userId);
    if (error) {
      console.error("[last-category.set]", error);
      throw new Error("Databasefejl. Prøv igen.");
    }
    return { ok: true };
  });
