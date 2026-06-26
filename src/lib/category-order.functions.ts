import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function dbError(scope: string, error: unknown): never {
  console.error(`[${scope}] DB error:`, error);
  throw new Error("Databasefejl. Prøv igen.");
}

export const getCategoryOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ order: string[] | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("category_order")
      .eq("id", userId)
      .maybeSingle();
    if (error) dbError("category-order.get", error);
    const v = (data as { category_order?: string[] | null } | null)?.category_order ?? null;
    return { order: v && v.length > 0 ? v : null };
  });

const setSchema = z.object({
  order: z.array(z.string().min(1).max(80)).max(200).nullable(),
});

export const setCategoryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ category_order: data.order })
      .eq("id", userId);
    if (error) dbError("category-order.set", error);
    return { ok: true };
  });
