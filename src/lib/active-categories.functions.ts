import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function dbError(scope: string, error: unknown): never {
  console.error(`[${scope}] DB error:`, error);
  throw new Error("Databasefejl. Prøv igen.");
}

export const getActiveCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ active: string[] | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("active_categories")
      .eq("id", userId)
      .maybeSingle();
    if (error) dbError("active-categories.get", error);
    const v =
      (data as { active_categories?: string[] | null } | null)
        ?.active_categories ?? null;
    return { active: v && v.length > 0 ? v : null };
  });

const setSchema = z.object({
  active: z.array(z.string().min(1).max(80)).max(200).nullable(),
});

export const setActiveCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ active_categories: data.active })
      .eq("id", userId);
    if (error) dbError("active-categories.set", error);
    return { ok: true };
  });
