import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function dbError(scope: string, error: unknown): never {
  console.error(`[${scope}] DB error:`, error);
  throw new Error("Databasefejl. Prøv igen.");
}

export const getRetentionDays = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ retentionDays: number | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("retention_days")
      .eq("id", userId)
      .maybeSingle();
    if (error) dbError("retention.get", error);
    const v = data?.retention_days ?? null;
    return { retentionDays: v === null ? null : Number(v) };
  });

const setSchema = z.object({
  retentionDays: z
    .number()
    .int()
    .min(1)
    .max(36500)
    .nullable(),
});

export const setRetentionDays = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ retention_days: data.retentionDays })
      .eq("id", userId);
    if (error) dbError("retention.set", error);
    return { ok: true };
  });

export const applyRetention = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ deleted: number }> => {
    const { supabase, userId } = context;

    const { data: profile, error: readErr } = await supabase
      .from("profiles")
      .select("retention_days")
      .eq("id", userId)
      .maybeSingle();
    if (readErr) dbError("retention.apply.read", readErr);

    const days = profile?.retention_days ?? null;
    if (days === null || days <= 0) {
      return { deleted: 0 };
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: deleted, error: delErr } = await supabase
      .from("measurements")
      .delete()
      .eq("user_id", userId)
      .lt("ended_at", cutoff)
      .select("id");
    if (delErr) dbError("retention.apply.delete", delErr);

    return { deleted: (deleted ?? []).length };
  });
