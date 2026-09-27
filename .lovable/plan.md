# Fjern kommentarer fra registreringer

## Hvad ændres
- Feltet "Kommentar (valgfri)" fjernes fra dialogerne "Gem registrering" og "Tilføj registrering".
- I listerne (forside og oversigt) fjernes pilen "Vis/Skjul kommentar", kommentarikonet og kommentarrækken med "Tilføj kommentar".
- Eksisterende kommentarer i databasen bliver liggende urørt (ingen data slettes), men vises og redigeres ikke længere.

## Tekniske detaljer
- `src/components/oversigt/MeasurementDialog.tsx`: fjern `comment`-state, textarea og `comment` i `onSave`-draft.
- `src/components/measurements/MeasurementsList.tsx`: fjern `commentEdit`, `expandedComments`, toggle-knap, kommentarrække og tilhørende ubrugte imports.
- `src/hooks/use-measurements.ts` og `src/lib/measurements.functions.ts`: fjern `comment` fra typer, drafts, offline-kø og insert/update-skemaer (kolonnen i databasen bevares, ingen migration).
