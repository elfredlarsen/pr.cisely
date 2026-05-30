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

export const listMeasurements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MeasurementRow[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("measurements")
      .select("id, started_at, ended_at, ms, category, hidden, comment")
      .order("ended_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (data ?? []) as MeasurementRow[];
  });

const createSchema = z.object({
  started_at: z.string().min(1).max(64),
  ended_at: z.string().min(1).max(64),
  ms: z.number().int().min(0).max(1000 * 60 * 60 * 24 * 30),
  category: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  comment: z.string().max(2000).optional(),
});

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
    if (error) throw new Error(error.message);
    return row as MeasurementRow;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  started_at: z.string().min(1).max(64).optional(),
  ended_at: z.string().min(1).max(64).optional(),
  ms: z.number().int().min(0).max(1000 * 60 * 60 * 24 * 30).optional(),
  category: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/).optional(),
  hidden: z.boolean().optional(),
  comment: z.string().max(2000).nullable().optional(),
});

export const updateMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...patch } = data;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase.from("measurements").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteMeasurement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("measurements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const dayBoundsSchema = z.object({
  from: z.string().min(1).max(64),
  to: z.string().min(1).max(64),
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
    if (error) throw new Error(error.message);
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
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAllMeasurements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("measurements").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

