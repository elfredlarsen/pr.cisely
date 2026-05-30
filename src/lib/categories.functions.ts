import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CategoryRow = {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  hidden: boolean;
};

async function assertAdmin(supabase: SupabaseClient, userId: string) {
  const { data: isAdmin, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "administrator",
  });
  if (error) dbError("categories", error);
  if (!isAdmin) throw new Error("Forbidden: administrator role required");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CategoryRow[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("categories")
      .select("id, value, label, sort_order, hidden")
      .order("sort_order", { ascending: true });
    if (error) dbError("categories", error);
    return data ?? [];
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(80).optional(),
  sort_order: z.number().int().min(0).max(100000).optional(),
});

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const patch: { label?: string; sort_order?: number } = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.sort_order !== undefined) patch.sort_order = data.sort_order;

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", data.id);
    if (error) dbError("categories", error);
    return { ok: true };
  });

const createSchema = z.object({
  label: z.string().trim().min(1).max(80),
});

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const label = data.label.trim();
    const base = slugify(label) || "kategori";

    // Find unik value
    const { data: existing, error: exErr } = await supabase
      .from("categories")
      .select("value");
    if (exErr) throw new Error(exErr.message);
    const taken = new Set((existing ?? []).map((r: { value: string }) => r.value));
    let value = base;
    let i = 2;
    while (taken.has(value)) {
      value = `${base}_${i++}`;
    }

    // Beregn næste sort_order
    const { data: maxRow, error: maxErr } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxErr) throw new Error(maxErr.message);
    const nextOrder = (maxRow?.sort_order ?? -1) + 1;

    const { data: inserted, error } = await supabase
      .from("categories")
      .insert({ value, label, sort_order: nextOrder, hidden: false })
      .select("id, value, label, sort_order, hidden")
      .single();
    if (error) dbError("categories", error);
    return inserted as CategoryRow;
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", data.id);
    if (error) dbError("categories", error);
    return { ok: true };
  });
