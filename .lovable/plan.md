Audit af alle ikon-knapper i appen viser at de har korrekte `aria-label`, men mangler visuelle hover-tooltips. Stopuret har dem allerede via `ShortcutTooltip`. Jeg tilføjer simple hover-tooltips på de resterende ikon-knapper.

**Mangler tooltips:**

1. `src/components/measurements/MeasurementsList.tsx`
   - Kommentar-toggle (linje ~465) → "Vis/skjul kommentar"
   - Slet registrering (linje ~488) → "Slet"
   - OK i kommentar-editor (linje ~548) → "Gem (Enter)"
   - Annuller i kommentar-editor (linje ~562) → "Annuller (Esc)"

2. `src/components/oversigt/DateNavigator.tsx`
   - Forrige dag (linje 45) → "Forrige dag"
   - Næste dag (linje 88) → "Næste dag"

3. `src/routes/_authenticated/admin.tsx`
   - Omdøb kategori (linje 247) → "Omdøb"
   - Slet kategori (linje 261) → "Slet"

4. `src/components/indstillinger/ChangePasswordForm.tsx`
   - Vis/skjul adgangskode (linje 71) → "Vis/Skjul adgangskode"

**Implementering:**
- Wrap hver ikon-knap i `<Tooltip><TooltipTrigger asChild>...</TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip>`.
- Sørg for at filerne ligger inden for en `TooltipProvider`. Tilføj en `TooltipProvider` lokalt omkring sektioner der ikke allerede har én (MeasurementsList, DateNavigator, admin kategori-række, ChangePasswordForm-input).
- Tooltip-styling: discrete, matche samme stil som ShortcutTooltip i stopuret (lille, baggrund/blur, muted tekst) — bruger standard `TooltipContent` med default delay.

Ingen ændringer i funktionalitet eller knaplayout.