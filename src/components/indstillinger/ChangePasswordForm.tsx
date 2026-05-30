import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const schema = z
  .object({
    currentPassword: z.string().min(1, { message: "Indtast din nuværende adgangskode" }),
    newPassword: z
      .string()
      .min(8, { message: "Adgangskoden skal være mindst 8 tegn" })
      .max(128, { message: "Adgangskoden er for lang" }),
    confirmPassword: z.string().min(1, { message: "Bekræft din nye adgangskode" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Adgangskoderne stemmer ikke overens",
  });

type FormValues = z.infer<typeof schema>;

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

interface PasswordFieldProps {
  name: FieldName;
  label: string;
  autoComplete: string;
  visible: boolean;
  onToggle: () => void;
  description?: string;
}

function PasswordField({
  name,
  label,
  autoComplete,
  visible,
  onToggle,
  description,
}: PasswordFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                className={cn("h-11 pr-12 rounded-md")}
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={visible ? "Skjul adgangskode" : "Vis adgangskode"}
              className="absolute right-1 top-1/2 h-11 w-11 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {visible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user?.email) {
        throw new Error("Kunne ikke verificere brugeren. Log ind igen.");
      }

      // Reauth: bekræft nuværende adgangskode
      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: userRes.user.email,
        password: values.currentPassword,
      });
      if (reauthErr) {
        form.setError("currentPassword", {
          type: "manual",
          message: "Nuværende adgangskode er forkert",
        });
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      if (updateErr) throw updateErr;

      toast.success("Adgangskode opdateret");
      form.reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke opdatere adgangskoden");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <PasswordField
          name="currentPassword"
          label="Nuværende adgangskode"
          autoComplete="current-password"
          visible={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
        />
        <PasswordField
          name="newPassword"
          label="Ny adgangskode"
          autoComplete="new-password"
          visible={showNew}
          onToggle={() => setShowNew((v) => !v)}
          description="Mindst 8 tegn."
        />
        <PasswordField
          name="confirmPassword"
          label="Bekræft ny adgangskode"
          autoComplete="new-password"
          visible={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
        />

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-h-11 px-5 font-semibold"
          >
            {form.formState.isSubmitting ? "Gemmer…" : "Gem adgangskode"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
