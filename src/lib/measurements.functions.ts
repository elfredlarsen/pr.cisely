import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MeasurementRow = {
  id: string;
  started_at: string;
  ended_at: string;
  ms: number;
  category: string;
  hidden: boolean;
  comment: string | null;
};

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
    const { data, error } = await supabase
      .from("measurements")
      .select("id, started_at, ended_at, ms, category, hidden, comment")
      .eq("user_id", userId)
      .order("ended_at", { ascending: false })
      .limit(1000);
    if (error) dbError("measurements.list", error);
    return (data ?? []) as MeasurementRow[];
  });

const createSchema = z
  .object({
    started_at: isoDate,
    ended_at: isoDate,
    ms: z.number().int().min(0).max(MAX_MS),
    category: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
    comment: z.string().max(2000).optional(),
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
    const { data: row, error } = await supabase
      .from("measurements")
      .insert({
        user_id: userId,
        started_at: data.started_at,
        ended_at: data.ended_at,
        ms: data.ms,
        category: data.category,
        hidden: false,
        comment: data.comment ?? null,
      })
      .select("id, started_at, ended_at, ms, category, hidden, comment")
      .single();
    if (error) dbError("measurements.create", error);
    return row as MeasurementRow;
  });

const updateSchema = z
  .object({
    id: z.string().uuid(),
    started_at: isoDate.optional(),
    ended_at: isoDate.optional(),
    ms: z.number().int().min(0).max(MAX_MS).optional(),
    category: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/).optional(),
    hidden: z.boolean().optional(),
    comment: z.string().max(2000).nullable().optional(),
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
    const { supabase } = context;
    const { id, ...patch } = data;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase.from("measurements").update(patch).eq("id", id);
    if (error) dbError("measurements.update", error);
    return { ok: true };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("measurements").delete().eq("id", data.id);
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
    const { supabase } = context;
    const { error } = await supabase
      .from("measurements")
      .delete()
      .gte("ended_at", data.from)
      .lt("ended_at", data.to)
      .eq("hidden", false);
    if (error) dbError("measurements.removeRange", error);
    return { ok: true };
  });

export const hideMeasurementsInRange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dayBoundsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("measurements")
      .update({ hidden: true })
      .gte("ended_at", data.from)
      .lt("ended_at", data.to)
      .eq("hidden", false);
    if (error) dbError("measurements.hideRange", error);
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
