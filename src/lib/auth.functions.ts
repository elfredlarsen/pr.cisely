import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyRoleInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    // Brug admin-client + eksplicit user_id-filter, så rolle-tjekket ikke
    // udelukkende afhænger af RLS-policyen på user_roles.
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) {
      console.error("[auth.roles] DB error:", error.message);
      throw new Error("Databasefejl. Prøv igen.");
    }

    const roles = (data ?? []).map((r) => r.role);
    return {
      userId,
      roles,
      isAdmin: roles.includes("administrator"),
    };
  });
