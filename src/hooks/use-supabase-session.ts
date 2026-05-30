import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  status: "loading" | "authenticated" | "unauthenticated";
  session: Session | null;
  userId: string | null;
};

/**
 * Lyt på Supabase-session ét sted. Returnerer current status uden at lave
 * yderligere queries — `is admin` håndteres via en separat server-fn query.
 */
export function useSupabaseSession(): AuthState {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    session: null,
    userId: null,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    // 1) Subscribe FØRST så vi ikke misser events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({
        status: session ? "authenticated" : "unauthenticated",
        session,
        userId: session?.user.id ?? null,
      });
      // Invalider alle queries på auth-skift (ny bruger = nye data)
      queryClient.invalidateQueries();
    });

    // 2) Hent eksisterende session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        status: data.session ? "authenticated" : "unauthenticated",
        session: data.session,
        userId: data.session?.user.id ?? null,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  return state;
}
