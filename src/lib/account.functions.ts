import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Deletes the signed-in user's own account; the DB function only ever touches auth.uid().
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("delete_my_account");
    if (error) {
      console.error("[account.delete] DB error:", error);
      throw new Error("Kontoen kunne ikke slettes. Prøv igen.");
    }
    return { ok: true };
  });
