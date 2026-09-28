import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function dbError(scope: string, error: unknown): never {
  console.error(`[${scope}] DB error:`, error);
  throw new Error("Databasefejl. Prøv igen.");
}


export type CategoryRow = {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  hidden: boolean;
};

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
      .eq("user_id", context.userId)
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

    const patch: { label?: string; sort_order?: number } = {};
    if (data.label !== undefined) patch.label = data.label;
    if (data.sort_order !== undefined) patch.sort_order = data.sort_order;

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) {
      if ((error as { code?: string }).code === "23503") {
        throw new Error("Kategorien bruges af registreringer og kan ikke slettes — skjul den i stedet.");
      }
      dbError("categories", error);
    }
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

    const label = data.label.trim();
    const base = slugify(label) || "kategori";

    // Find unik value
    const { data: existing, error: exErr } = await supabase
      .from("categories")
      .select("value")
      .eq("user_id", userId);
    if (exErr) dbError("categories.create", exErr);
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
      .eq("user_id", userId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxErr) dbError("categories.create", maxErr);
    const nextOrder = (maxRow?.sort_order ?? -1) + 1;

    const { data: inserted, error } = await supabase
      .from("categories")
      .insert({ value, label, sort_order: nextOrder, hidden: false, user_id: userId })
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

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) {
      if ((error as { code?: string }).code === "23503") {
        throw new Error("Kategorien bruges af registreringer og kan ikke slettes — skjul den i stedet.");
      }
      dbError("categories", error);
    }
    return { ok: true };
  });
const setOrderSchema = z.object({
  order: z.array(z.string().min(1).max(80)).max(200).nullable(),
});

export const setCategoryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setOrderSchema.parse(input))
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
const setActiveSchema = z.object({
  active: z.array(z.string().min(1).max(80)).max(200).nullable(),
});

export const setActiveCategories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setActiveSchema.parse(input))
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
