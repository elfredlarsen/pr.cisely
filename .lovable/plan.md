## Ændringer

### 1. Toast "Registrering gemt" — kompakt + manuel luk
Fil: `src/routes/__root.tsx` (eller hvor `<Toaster />` er monteret) og `src/components/ui/sonner.tsx`.

- Sæt `position="top-right"` og smallere bredde (`width: 280px` via `style`) på `<Toaster />`, så den ikke overlapper "Gem registrering"-dialogen (der ligger under stopuret).
- Aktivér luk-kryds via `closeButton` prop på `<Toaster />` (Sonner viser et indbygget × i hjørnet).
- Reducer padding/font-størrelse i `toastOptions.classNames.toast` så den fremstår mere kompakt (`p-2 text-xs`).

### 2. Knapperne "Annuller" og "Gem" — tydelige hover/fokus
Fil: `src/components/stopwatch/FinishPanel.tsx`.

- **Annuller**: hover skifter baggrund fra `bg-background` til `bg-muted` (mørkere, ikke bare ring). Fokus: `focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2` (mørk #1a1a1a ring, ikke lilla).
- **Gem**: hover skifter til `hover:bg-primary/80` (tydeligt mørkere lilla, ikke kun lysere). Fokus: `focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2` (mørk ring i kontrast til lilla baggrund).

### 3. Tabellen "Seneste registreringer" — træd i baggrunden
Fil: `src/routes/index.tsx` og `src/components/stopwatch/MeasurementsTable.tsx`.

- Større luft mellem stopur og tabel: tilføj `mt-12` (eller `pt-12`) på tabel-containeren i `index.tsx`.
- Mere kompakt tabel:
  - Reducer `px-6 pb-6 pt-4` → `px-4 pb-3 pt-2` på tabel-wrapperen.
  - Sæt mindre række-højde via Tailwind på `<TableRow>` / celler (`py-1`, `text-xs`).
  - Reducer header-tekst til `text-[11px]` med `text-muted-foreground/70`.
- Dæmp visuelt:
  - Tilføj `opacity-80` på hele `<section>` i `MeasurementsTable`.
  - Brug `text-muted-foreground/80` på celleknapper i stedet for fuld `text-muted-foreground`.

## Ingen ændringer i forretningslogik
Kun Tailwind-klasser og Sonner-konfiguration. Ingen ændring af hooks, data eller routing.