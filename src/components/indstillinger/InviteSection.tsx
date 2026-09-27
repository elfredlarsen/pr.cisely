import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSignupKey } from "@/lib/signup.functions";

export function InviteSection() {
  const fetchKey = useServerFn(getSignupKey);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState<"key" | "link" | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["signup-key"],
    queryFn: () => fetchKey(),
    staleTime: 5 * 60 * 1000,
  });

  const key = data?.key ?? null;
  const link = key
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/login?key=${encodeURIComponent(key)}`
    : "";

  async function copy(value: string, what: "key" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
      toast.success(what === "key" ? "Adgangsnøgle kopieret" : "Invitationslink kopieret");
    } catch {
      toast.error("Kunne ikke kopiere. Markér teksten, og kopiér manuelt.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Henter adgangsnøgle …</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Adgangsnøglen kunne ikke hentes. Prøv at genindlæse siden.
      </p>
    );
  }

  if (!key) {
    return (
      <p className="text-sm text-muted-foreground">
        Der er ikke opsat nogen adgangsnøgle endnu, så nye konti kan ikke oprettes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Del adgangsnøglen eller linket med en kollega, så kan de oprette en konto.
      </p>

      <div className="space-y-2">
        <label htmlFor="signup-key" className="text-sm font-medium">
          Adgangsnøgle
        </label>
        <div className="flex gap-2">
          <Input
            id="signup-key"
            readOnly
            value={visible ? key : "•".repeat(Math.min(key.length, 20))}
            className="font-mono"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={visible ? "Skjul adgangsnøgle" : "Vis adgangsnøgle"}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Kopiér adgangsnøgle"
            onClick={() => copy(key, "key")}
          >
            {copied === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="button" className="w-full" onClick={() => copy(link, "link")}>
        {copied === "link" ? "Invitationslink kopieret" : "Kopiér invitationslink"}
      </Button>
    </div>
  );
}
