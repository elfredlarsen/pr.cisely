import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyRoleInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
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
