## Mål

Tilføj en "Datahåndtering"-sektion på `/indstillinger` med (1) en auto-slet-dropdown og (2) en "Slet al historik"-knap med bekræftelsesdialog. Følger samme stil som Konto-sektionen.

## Ændringer

### 1. Ny komponent: `src/components/indstillinger/DataManagementSection.tsx`

- **Auto-slet**:
  - `<Select>` (shadcn) med options: "30 dage", "60 dage", "90 dage", "180 dage", "365 dage", "Aldrig".
  - Værdier gemmes som `"30" | "60" | "90" | "180" | "365" | "never"` i `localStorage` under nøglen `precisely.autoDeleteDays`. Default: `"never"`.
  - Læses ved mount via `useEffect` (SSR-safe, ligesom `format` i `arkiv.tsx`).
  - Skift gemmes straks; viser `toast.success("Auto-slet opdateret")`.
  - Under dropdown: hjælpetekst `<p className="text-sm text-muted-foreground">` med "Registreringer ældre end det valgte antal dage slettes automatisk."
  - Label "Auto-slet" vist over dropdown (matcher form-stil i Konto).

- **Slet al historik**:
  - `<Button variant="destructive">Slet al historik</Button>` (eksisterende destructive-variant bruger `--destructive` token; tjek at det matcher korall #f64f59 — hvis ikke, brug inline-stil `style={{ backgroundColor: "#f64f59" }}` med hvid tekst, jf. DESIGN.md fejlfarve).
  - Wrappet i `<AlertDialog>` (samme komponent som bruges i `arkiv.tsx`):
    - Titel: "Er du sikker?"
    - Beskrivelse: "Denne handling kan ikke fortrydes."
    - Knapper: "Annuller" (AlertDialogCancel, outline/sekundær) og "Slet alt" (AlertDialogAction, rød destructive).
    - Ved bekræftelse kaldes `removeAll()` fra `useMeasurements` og viser `toast.success("Al historik slettet")`.

- Mindst 8px luft mellem klikbare elementer (`space-y-*`), knapper ≥ 44px høje (`min-h-11`).

### 2. Faktisk auto-slet-logik (minimal)

For at indstillingen ikke kun er kosmetisk: i `src/hooks/use-measurements.ts` ved første mount (efter `read()`), tjek `precisely.autoDeleteDays`. Hvis værdien er et tal, filtrér målinger hvor `endedAt` er ældre end (nu − N dage) og persistér resultatet. Hvis "never" eller ikke sat: ingen ændring. Tilføjes som en lille hjælpefunktion `pruneOld(items, days)` der returnerer et nyt array; kaldes i `useEffect`'en. Påvirker ikke seed-logik (seed er dagens registreringer).

### 3. Wire-up i `src/routes/indstillinger.tsx`

Tilføj `<DataManagementSection />` under Konto-sektionen, i samme `<section class="rounded-lg border border-border bg-card p-6">`-stil, med `aria-labelledby="data-heading"` og overskrift `<h2 id="data-heading">Datahåndtering</h2>`. Underafsnit centreres som Konto-sektionen (`text-center` på header, `mx-auto max-w-md` på indholdsblokken).

## Tekniske noter

- Bruger eksisterende `@/components/ui/select`, `@/components/ui/button`, `@/components/ui/alert-dialog`, `sonner`.
- Ingen nye dependencies.
- Slet-handlingen rammer ALLE målinger på tværs af alle dage (samme som "Slet alt" i `/arkiv`).

## Verifikation

- `/indstillinger`: Datahåndtering-sektion vises under Konto, centreret.
- Dropdown viser alle 6 valg og persisterer valg ved reload.
- Hjælpeteksten står i `text-muted-foreground` under dropdown.
- "Slet al historik"-knappen er rød. Klik åbner dialog. "Annuller" lukker uden ændring. "Slet alt" tømmer `useMeasurements` (verificer på `/` og `/arkiv` at listen er tom) og viser toast.
- Hvis auto-slet sættes til fx 30 dage og der findes (manuelt indsatte) gamle målinger, fjernes de ved næste app-load.
