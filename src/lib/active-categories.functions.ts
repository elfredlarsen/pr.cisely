import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function dbError(scope: string, error: unknown): never {
  console.error(`[${scope}] DB error:`, error);
  throw new Error("Databasefejl. Prøv igen.");
}

// Aktive kategorier = categories.hidden = false. `null` betyder "alle aktive".
export const getActiveCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ active: string[] | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("categories")
      .select("value, hidden")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });
    if (error) dbError("active-categories.get", error);
    const rows = data ?? [];
    if (!rows.some((r) => r.hidden)) return { active: null };
    return { active: rows.filter((r) => !r.hidden).map((r) => r.value) };
  });

const setSchema = z.object({
  active: z.array(z.string().min(1).max(80)).max(200).nullable(),
});

export const setActiveCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.active === null) {
      const { error } = await supabase
        .from("categories")
        .update({ hidden: false })
        .eq("user_id", userId);
      if (error) dbError("active-categories.set", error);
      return { ok: true };
    }
    const list = data.active;
    const { error: e1 } = await supabase
      .from("categories")
      .update({ hidden: true })
      .eq("user_id", userId)
      .not("value", "in", `(${list.map((v) => `"${v.replace(/"/g, "")}"`).join(",")})`);
    if (e1) dbError("active-categories.set", e1);
    const { error: e2 } = await supabase
      .from("categories")
      .update({ hidden: false })
      .eq("user_id", userId)
      .in("value", list);
    if (e2) dbError("active-categories.set", e2);
    return { ok: true };
  });
