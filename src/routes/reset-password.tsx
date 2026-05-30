import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nulstil adgangskode · pr:cisely" },
      { name: "description", content: "Vælg en ny adgangskode." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase lægger en recovery-session i URL-hashen og emitter PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Adgangskoden skal være mindst 8 tegn");
      return;
    }
    if (password !== confirm) {
      toast.error("Adgangskoderne stemmer ikke overens");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Adgangskode opdateret. Log ind med din nye adgangskode.");
      await supabase.auth.signOut();
      navigate({ to: "/login", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke nulstille adgangskoden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="text-center text-2xl font-medium tracking-[-0.5px] text-foreground">
          <span>pr</span>
          <span
            aria-hidden="true"
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            :
          </span>
          <span>cisely</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Vælg en ny adgangskode
        </p>

        {!ready ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Klik på linket i mailen for at fortsætte.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="new-password">Ny adgangskode</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Bekræft adgangskode</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Gemmer..." : "Gem ny adgangskode"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
