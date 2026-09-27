import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function dbError(scope: string, error: unknown): never {
  console.error(`[${scope}] DB error:`, error);
  throw new Error("Databasefejl. Prøv igen.");
}

// Rækkefølgen ligger nu i categories.sort_order; listCategories sorterer allerede efter den.
export const getCategoryOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<{ order: string[] | null }> => ({ order: null }));

const setSchema = z.object({
  order: z.array(z.string().min(1).max(80)).max(200).nullable(),
});

export const setCategoryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.order) return { ok: true };
    const results = await Promise.all(
      data.order.map((value, i) =>
        supabase
          .from("categories")
          .update({ sort_order: i })
          .eq("user_id", userId)
          .eq("value", value),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) dbError("category-order.set", failed.error);
    return { ok: true };
  });
