import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export const checkSignupKey = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ key: z.string().max(512) }).parse(input)
  )
  .handler(async ({ data }) => {
    const expected = process.env.SIGNUP_ACCESS_KEY;
    if (!expected) return { valid: false };
    return { valid: timingSafeEqual(data.key, expected) };
  });

export const signUpWithKey = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        password: z.string().min(6).max(128),
        key: z.string().max(512),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const expected = process.env.SIGNUP_ACCESS_KEY;
    if (!expected || !timingSafeEqual(data.key, expected)) {
      throw new Error("Ugyldig eller manglende adgangskode til oprettelse.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });
