import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Privatliv og vilkår · pr:cisely";
const DESC = "Sådan behandler pr:cisely dine data, hvor længe de gemmes, og vilkårene for brug.";

export const Route = createFileRoute("/privatliv")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivatlivPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivatlivPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <article className="mx-auto w-full max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-medium tracking-[-0.5px] text-foreground">Privatliv og vilkår</h1>
          <p className="text-xs text-muted-foreground">Senest opdateret: 27. september 2026</p>
        </header>

        <Section title="1. Hvem står bag">
          <p>Dataansvarlig: [Navn] – kontakt: [e-mail]. Skriv til denne adresse med spørgsmål om dine data.</p>
        </Section>

        <Section title="2. Hvilke data gemmes">
          <p>Din e-mail, din adgangskode (krypteret – vi kan ikke se den), dine registreringer (tider og kategorier), dine egne kategorier og dine indstillinger.</p>
        </Section>

        <Section title="3. Formål">
          <p>Data bruges kun til at få appen til at virke for dig. Vi viser ingen reklamer, sælger ikke data og bruger ingen sporing.</p>
        </Section>

        <Section title="4. Hvor data ligger">
          <p>Data opbevares hos appens hosting- og databaseudbyder. Kun du kan se dine egne data.</p>
        </Section>

        <Section title="5. Hvor længe gemmes data">
          <p>Registreringer slettes automatisk efter den periode, du selv vælger under Indstillinger (standard 30 dage).</p>
          <p className="font-medium text-foreground">Konti, hvor der ikke er logget ind i 2 år, slettes automatisk sammen med alle tilhørende data. Der sendes ingen varsel inden sletningen.</p>
        </Section>

        <Section title="6. Dine rettigheder">
          <p>Du har ret til indsigt i, rettelse af og sletning af dine data. Du kan selv slette al historik under Indstillinger, eller kontakte os for at få slettet din konto. Du kan klage til Datatilsynet (datatilsynet.dk).</p>
        </Section>

        <Section title="7. Brugervilkår">
          <p>Adgang gives kun via invitationslink. Appen bruges på eget ansvar og leveres uden garanti for oppetid eller at data ikke går tabt. Vilkårene kan ændres; den gældende version står altid på denne side.</p>
        </Section>

        <Link to="/login" className="inline-block text-sm text-muted-foreground underline-offset-2 hover:underline">
          Tilbage
        </Link>
      </article>
    </div>
  );
}
