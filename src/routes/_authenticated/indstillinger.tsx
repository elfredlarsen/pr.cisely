import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/stopwatch/TopNav";
import { ChangePasswordForm } from "@/components/indstillinger/ChangePasswordForm";
import { DataManagementSection } from "@/components/indstillinger/DataManagementSection";
import { CategoriesSection } from "@/components/indstillinger/CategoriesSection";
import { InviteSection } from "@/components/indstillinger/InviteSection";
import { AppearanceSection } from "@/components/indstillinger/AppearanceSection";

export const Route = createFileRoute("/_authenticated/indstillinger")({
  head: () => ({
    meta: [
      { title: "Indstillinger · pr:cisely" },
      { name: "description", content: "Administrer din konto og indstillinger i pr:cisely." },
      { property: "og:title", content: "Indstillinger · pr:cisely" },
      { property: "og:description", content: "Administrer din konto og indstillinger i pr:cisely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IndstillingerPage,
});

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-border/70 bg-card shadow-card p-6">
      <header className="mb-5">
        <h2 id={id} className="text-base font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

function IndstillingerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Indstillinger</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Konto, kategorier, udseende og dine data.
          </p>
        </header>

        <div className="space-y-6">
          <Section id="adgangskode-heading" title="Skift adgangskode" description="Vælg en ny adgangskode på mindst 8 tegn.">
            <ChangePasswordForm />
          </Section>
          <Section id="invite-heading" title="Inviter en kollega" description="Del linket, så en kollega kan oprette en konto.">
            <InviteSection />
          </Section>
          <Section id="kategorier-heading" title="Kategorier" description="Vælg hvilke kategorier der vises, når du gemmer en registrering.">
            <CategoriesSection />
          </Section>
          <Section id="udseende-heading" title="Udseende" description="Lyst, mørkt eller det samme som din enhed.">
            <AppearanceSection />
          </Section>
          <Section id="mine-data-heading" title="Mine data" description="Styr hvordan dine registreringer opbevares og slettes.">
            <DataManagementSection />
          </Section>
        </div>
      </main>
    </div>
  );
}
