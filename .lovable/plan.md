Plan
====

1. I `src/components/stopwatch/MeasurementsTable.tsx`:
   - Fjern overskriften "Dagens registreringer" ( `<h2>` med `id="historik-overskrift"`).
   - Flyt "Ryd historik"-knappen ned i tabel-headeren (`<TableHeader>`), højrejusteret i den sidste kolonne (`Handlinger`).
   - Tilføj Tooltip fra `@/components/ui/tooltip` omkring tabellen/sektionen med teksten "Seneste registreringer", der vises ved hover.
   - Opdater `aria-labelledby` på `<section>` hvis nødvendigt efter overskriftens fjernelse.

2. Ingen andre filer ændres.

Tekniske detaljer
-----------------
- Tooltip: Bruger eksisterende `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` fra `@/components/ui/tooltip`.
- Layout: `Ryd historik` renderes i stedet inde i `<TableHead>` i den sidste kolonne, højrejusteret (`justify-end`).
- Rubrikken fjernes helt — sektionen har ikke længere en synlig overskrift, men tilgængeligheden bevares via tooltip-beskrivelsen.