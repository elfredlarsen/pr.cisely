## Problem

Historik-kortet er centreret vertikalt med `py-10` padding, og kortet tager kun sin naturlige højde (`max-h-full`). Det betyder at der bliver scrollet selvom der er masser af lodret plads tilbage på siden.

## Løsning

I `src/routes/index.tsx`:

- Skift wrapperen om `<MeasurementsTable>` fra `flex min-h-0 flex-1 items-center justify-center px-6 py-10` til `flex min-h-0 flex-1 flex-col items-center px-6 pt-6 pb-8`.

Det fjerner den vertikale centrering, så kortet ankres øverst med et lille top/bund-padding og kan udnytte hele den tilgængelige højde.

I `src/components/stopwatch/MeasurementsTable.tsx`:

- Skift `section`-className fra `flex max-h-full w-full flex-col` til `flex h-full w-full flex-col` så `section` fylder hele wrapperen.
- Skift indre scroll-div'en fra `max-h-full ... ` til `flex-1` så scroll-containeren tager al resterende højde, hvilket gør at flere rækker er synlige før scroll sættes ind.

## Verifikation

- `/`: bekræft at historik-tabellen viser markant flere rækker uden scroll på en typisk viewport (~707px høj).
- Lange lister scroller stadig korrekt med sticky header.
- Stadig pæn afstand til knapperne ovenfor og siden bunden nedenfor.