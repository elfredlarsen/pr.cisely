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
      <article className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card shadow-card p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-medium tracking-[-0.5px] text-foreground">Privatliv og vilkår</h1>
          <p className="text-xs text-muted-foreground">Senest opdateret: 4. oktober 2026</p>
        </header>

        <p className="text-sm leading-relaxed text-muted-foreground">
          pr:cisely er et personligt værktøj til din egen tidsregistrering. Det bruges ikke af arbejdsgivere til at registrere ansattes arbejdstid, og dine data deles ikke med nogen.
        </p>

        <Section title="1. Hvem står bag">
          <p>
            Dataansvarlig: Carina Larsen – kontakt:{" "}
            <a href="mailto:elfredlarsen@gmail.com" className="underline underline-offset-2">
              elfredlarsen@gmail.com
            </a>
            . Skriv til denne adresse med spørgsmål om dine data.
          </p>
        </Section>

        <Section title="2. Hvilke data gemmes">
          <p>Din e-mail, din adgangskode (krypteret – vi kan ikke se den), dine registreringer (tider og kategorier), dine egne kategorier og dine indstillinger.</p>
          <p>Vi gemmer ikke IP-adresser, placering eller fritekstnoter.</p>
        </Section>

        <Section title="3. Formål">
          <p>Data bruges kun til at få appen til at virke for dig. Vi viser ingen reklamer, sælger ikke data og bruger ingen sporing.</p>
        </Section>

        <Section title="4. Retsgrundlag">
          <p>Vi behandler dine data for at levere den tjeneste, du selv har bedt om (aftale, jf. GDPR art. 6, stk. 1, litra b).</p>
        </Section>

        <Section title="5. Hvor data ligger">
          <p>Data opbevares hos appens hosting- og databaseudbyder inden for EU/EØS eller med tilsvarende beskyttelse. Kun du kan se dine egne data.</p>
          <p>Der bruges ingen cookies til sporing – kun det nødvendige for at holde dig logget ind.</p>
        </Section>

        <Section title="6. Hvor længe gemmes data">
          <p>Registreringer slettes automatisk efter den periode, du selv vælger under Indstillinger (standard 30 dage).</p>
          <p className="font-medium text-foreground">Konti, hvor der ikke er logget ind i 2 år, slettes automatisk sammen med alle tilhørende data. Der sendes ingen varsel inden sletningen.</p>
        </Section>

        <Section title="7. Dine rettigheder">
          <ul className="list-disc space-y-1 pl-5">
            <li>Indsigt og kopi af dine data: skriv til kontaktmailen.</li>
            <li>Sletning af historik: gør det selv under Indstillinger.</li>
            <li>Sletning af hele kontoen: skriv til kontaktmailen.</li>
            <li>Vi svarer inden for 30 dage.</li>
            <li>Du kan klage til Datatilsynet (datatilsynet.dk).</li>
          </ul>
        </Section>

        <Section title="8. Brugervilkår">
          <p>pr:cisely er kun til personlig brug. Adgang gives kun via invitationslink. Appen bruges på eget ansvar og leveres uden garanti for oppetid eller at data ikke går tabt. Vilkårene kan ændres; den gældende version står altid på denne side.</p>
        </Section>

        <Link to="/login" className="inline-block text-sm text-muted-foreground underline-offset-2 hover:underline">
          Tilbage
        </Link>
      </article>
    </div>
  );
}
