## Plan

To kombinerede ændringer så historiktabellen får mere plads:

### 1) Tillad sidescroll og giv tabellen min-højde

`src/routes/_authenticated/index.tsx`:
- Skift den ydre wrapper fra `h-screen` til `min-h-screen` så hele siden må scrolle.
- Fjern `min-h-0 flex-1` fra `<main>` (ikke nødvendigt længere).
- Giv tabel-containeren (`<div>` omkring `<MeasurementsTable>`) `min-h-[60vh]` så historikken altid har plads til flere rækker.

### 2) Gør stopur og knapper en smule mindre

`src/components/stopwatch/Stopwatch.tsx`:
- `baseBtn`: `h-14 w-44 ... px-6 py-3 text-xl gap-3` → `h-12 w-40 ... px-5 py-2.5 text-lg gap-2.5`.
- Alle ikoner i knapperne: `h-7 w-7` → `h-6 w-6`.
- Sektionen: `py-12` → `py-8`.
- Gap mellem display og knapper: `gap-12` → `gap-8`.

`src/components/stopwatch/TimeDisplay.tsx`:
- Talstørrelse: `clamp(4rem, 16vw, 12rem)` → `clamp(3.25rem, 13vw, 9rem)`.

Ingen ændringer i funktionalitet eller layout-flow ud over disse størrelser.
