import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MeasurementRow = {
  id: string;
  started_at: string;
  ended_at: string;
  ms: number;
  category_id: string;
  /** Kategoriens værdi, slået op via category_id. */
  category: string;
};

type Sb = SupabaseClient<Database>;

async function categoryIdFor(supabase: Sb, userId: string, value: string): Promise<string> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .eq("value", value)
    .maybeSingle();
  if (error) dbError("measurements.category", error);
  if (!data) throw new Error("Ukendt kategori");
  return data.id as string;
}

function dbError(scope: string, error: { message: string }): never {
  console.error(`[${scope}] DB error:`, error.message);
  throw new Error("Databasefejl. Prøv igen.");
}

const isoDate = z
  .string()
  .min(1)
  .max(64)
  .refine((v) => !Number.isNaN(Date.parse(v)), "Ugyldig dato");

const MAX_MS = 1000 * 60 * 60 * 24 * 30;

export const listMeasurements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MeasurementRow[]> => {
    const { supabase, userId } = context;
    const [{ data, error }, { data: cats, error: catErr }] = await Promise.all([
      supabase
        .from("measurements")
        .select("id, started_at, ended_at, ms, category_id")
        .eq("user_id", userId)
        .order("ended_at", { ascending: false })
        .limit(1000),
      supabase.from("categories").select("id, value").eq("user_id", userId),
    ]);
    if (error) dbError("measurements.list", error);
    if (catErr) dbError("measurements.list", catErr);
    const byId = new Map((cats ?? []).map((c) => [c.id, c.value]));
    return (data ?? []).map((r) => ({
      ...r,
      ms: Number(r.ms),
      category: byId.get(r.category_id) ?? "",
    }));
  });

const createSchema = z
  .object({
    started_at: isoDate,
    ended_at: isoDate,
    ms: z.number().int().min(0).max(MAX_MS),
    category: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  })
  .refine((d) => Date.parse(d.ended_at) >= Date.parse(d.started_at), {
    message: "ended_at skal være efter started_at",
    path: ["ended_at"],
  })
  .refine(
    (d) => Math.abs(Date.parse(d.ended_at) - Date.parse(d.started_at) - d.ms) <= 2000,
    { message: "ms passer ikke til tidsintervallet", path: ["ms"] },
  );

export const createMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }): Promise<MeasurementRow> => {
    const { supabase, userId } = context;
    const categoryId = await categoryIdFor(supabase, userId, data.category);
    const { data: row, error } = await supabase
      .from("measurements")
      .insert({
        user_id: userId,
        started_at: data.started_at,
        ended_at: data.ended_at,
        ms: data.ms,
        category_id: categoryId,
      })
      .select("id, started_at, ended_at, ms, category_id")
      .single();
    if (error) dbError("measurements.create", error);
    return { ...row, ms: Number(row.ms), category: data.category };
  });

const updateSchema = z
  .object({
    id: z.string().uuid(),
    started_at: isoDate.optional(),
    ended_at: isoDate.optional(),
    ms: z.number().int().min(0).max(MAX_MS).optional(),
    category: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/).optional(),
  })
  .refine(
    (d) =>
      d.started_at === undefined ||
      d.ended_at === undefined ||
      Date.parse(d.ended_at) >= Date.parse(d.started_at),
    { message: "ended_at skal være efter started_at", path: ["ended_at"] },
  );

export const updateMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, category, ...rest } = data;
    const patch: { started_at?: string; ended_at?: string; ms?: number; category_id?: string } = { ...rest };
    if (category !== undefined) {
      patch.category_id = await categoryIdFor(supabase, userId, category);
    }
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase
      .from("measurements")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) dbError("measurements.update", error);
    return { ok: true };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("measurements")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) dbError("measurements.delete", error);
    return { ok: true };
  });

const dayBoundsSchema = z.object({
  from: isoDate,
  to: isoDate,
});

export const removeMeasurementsInRange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dayBoundsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("measurements")
      .delete()
      .eq("user_id", userId)
      .gte("ended_at", data.from)
      .lt("ended_at", data.to)
      ;
    if (error) dbError("measurements.removeRange", error);
    return { ok: true };
  });

export const removeAllMeasurements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("measurements").delete().eq("user_id", userId);
    if (error) dbError("measurements.removeAll", error);
    return { ok: true };
  });
