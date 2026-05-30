import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/stopwatch/TopNav";
import { ChangePasswordForm } from "@/components/indstillinger/ChangePasswordForm";
import { DataManagementSection } from "@/components/indstillinger/DataManagementSection";

export const Route = createFileRoute("/indstillinger")({
  head: () => ({
    meta: [
      { title: "Indstillinger · pr:cisely" },
      {
        name: "description",
        content: "Administrer din konto og indstillinger i pr:cisely.",
      },
      { property: "og:title", content: "Indstillinger · pr:cisely" },
      {
        property: "og:description",
        content: "Administrer din konto og indstillinger i pr:cisely.",
      },
    ],
  }),
  component: IndstillingerPage,
});

function IndstillingerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="sr-only">Indstillinger</h1>

        <section
          aria-labelledby="konto-heading"
          className="mt-8 rounded-lg border border-border bg-card p-6"
        >
          <header className="mb-6 text-center">
            <h2 id="konto-heading" className="text-lg font-semibold">
              Konto
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Administrer din adgangskode og kontooplysninger.
            </p>
          </header>

          <div>
            <h3 className="text-center text-sm font-semibold">Skift adgangskode</h3>
            <div className="mx-auto mt-4 max-w-md">
              <ChangePasswordForm />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="data-heading"
          className="mt-6 rounded-lg border border-border bg-card p-6"
        >
          <header className="mb-6 text-center">
            <h2 id="data-heading" className="text-lg font-semibold">
              Datahåndtering
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Styr hvordan dine registreringer opbevares og slettes.
            </p>
          </header>

          <div className="mx-auto max-w-md">
            <DataManagementSection />
          </div>
        </section>
      </main>
    </div>
  );
}
