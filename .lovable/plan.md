Standardisér tooltips på tværs af appen — ensartet stil, placering, delay og tekstkonvention.

**Konvention**

- **Placering:** altid `side="top"`, `sideOffset={6}`.
- **Delay:** `delayDuration={400}` overalt.
- **Stil:** samme klasser — `rounded border border-border/30 bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground shadow-none backdrop-blur-sm`.
- **Tekst:** imperativ verbum + objekt, ingen punktum (fx "Slet registrering", "Omdøb kategori", "Forrige dag"). Holde det kort men beskrivende — undgå rene enkeltord når kontekst er nyttig.
- **Tastatur-shortcut:** vises som lille `<kbd>` efter teksten i samme tooltip.

**Refactor**

1. Udvid `src/components/ui/icon-tooltip.tsx` til at acceptere optional `shortcut?: string`. Når sat, rendres label + en `<kbd>`-chip identisk med stopurets nuværende stil.
2. Erstat `ShortcutTooltip` i `src/components/stopwatch/Stopwatch.tsx` med `IconTooltip` så de bruger samme komponent og stil. Fjern den lokale `TooltipProvider` (IconTooltip leverer sin egen).

**Tekst-justering**

- `src/components/measurements/MeasurementsList.tsx`
  - "Vis/Skjul kommentar" → bevares ("Vis kommentar" / "Skjul kommentar")
  - "Slet" → "Slet registrering"
  - "Gem (Enter)" → label "Gem", shortcut `Enter`
  - "Annuller (Esc)" → label "Annuller", shortcut `Esc`
- `src/routes/_authenticated/admin.tsx`
  - "Omdøb" → "Omdøb kategori"
  - "Slet" → "Slet kategori"
- `src/components/oversigt/DateNavigator.tsx` — bevares ("Forrige dag", "Næste dag").
- `src/components/indstillinger/ChangePasswordForm.tsx` — bevares ("Vis adgangskode" / "Skjul adgangskode").
- Stopur (efter refactor): label `Start`/`Pause`/`Fortsæt`/`Nulstil`/`Afslut` + shortcuts (Mellemrum/N/A).

Ingen ændringer i funktionalitet.