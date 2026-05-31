import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { checkSignupKey, signUpWithKey } from "@/lib/signup.functions";

const searchSchema = z.object({ key: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Log ind · pr:cisely" },
      { name: "description", content: "Log ind på pr:cisely." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { key: signupKey } = useSearch({ from: "/login" });
  const checkKey = useServerFn(checkSignupKey);
  const signUp = useServerFn(signUpWithKey);

  const [keyValid, setKeyValid] = useState<boolean | null>(
    signupKey ? null : false
  );
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const keyParam = useMemo(() => signupKey ?? "", [signupKey]);

  // Validér signup-nøgle (hvis nogen er angivet i URL'en)
  useEffect(() => {
    if (!keyParam) {
      setKeyValid(false);
      return;
    }
    let cancelled = false;
    checkKey({ data: { key: keyParam } })
      .then((res) => {
        if (!cancelled) setKeyValid(res.valid);
      })
      .catch(() => {
        if (!cancelled) setKeyValid(false);
      });
    return () => {
      cancelled = true;
    };
  }, [keyParam, checkKey]);

  // Hvis allerede logget ind, redirect til /
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/", replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logget ind");
      } else {
        if (!keyValid) throw new Error("Du skal bruge et gyldigt link for at oprette en konto.");
        await signUp({ data: { email, password, key: keyParam } });
        // Log straks ind efter oprettelse
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        toast.success("Konto oprettet");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Noget gik galt";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Tjek din mail for et link til at nulstille adgangskoden.");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke sende mail");
    } finally {
      setForgotLoading(false);
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
          {mode === "signin" ? "Log ind på din konto" : "Opret en ny konto"}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Adgangskode</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Vent..." : mode === "signin" ? "Log ind" : "Opret konto"}
          </Button>
        </form>

        {mode === "signin" && (
          <div className="mt-3 text-center text-xs">
            <button
              type="button"
              className="text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => {
                setForgotEmail(email);
                setForgotOpen(true);
              }}
            >
              Glemt adgangskode?
            </button>
          </div>
        )}

        {keyValid && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => setMode("signup")}
              >
                Ingen konto? Opret en
              </button>
            ) : (
              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => setMode("signin")}
              >
                Har du allerede en konto? Log ind
              </button>
            )}
          </div>
        )}
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nulstil adgangskode</DialogTitle>
            <DialogDescription>
              Indtast din e-mail, så sender vi et link til at vælge en ny adgangskode.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="forgot-email">E-mail</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotOpen(false)}
                disabled={forgotLoading}
              >
                Annuller
              </Button>
              <Button type="submit" disabled={forgotLoading || !forgotEmail}>
                {forgotLoading ? "Sender..." : "Send link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
