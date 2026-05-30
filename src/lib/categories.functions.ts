import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CategoryRow = {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  hidden: boolean;
};

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CategoryRow[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("categories")
      .select("id, value, label, sort_order, hidden")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(200).optional(),
  hidden: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(100000).optional(),
});

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Server-side admin check (RLS is the backstop)
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "administrator",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: administrator role required");

    const patch: Record<string, unknown> = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.hidden !== undefined) patch.hidden = data.hidden;
    if (data.sort_order !== undefined) patch.sort_order = data.sort_order;

    if (Object.keys(patch).length === 0) {
      return { ok: true };
    }

    const { error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
