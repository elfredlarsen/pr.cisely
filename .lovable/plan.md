## Problem

Historik-tabellen på forsiden ligger klistret op til Start/Afslut-knapperne (kun `pt-12` over) og strækker sig helt til bunden, så der ikke er luft under den. Du vil have den centreret vertikalt i pladsen mellem knapperne og den synlige bund af viewporten, med større afstand til alle kanter.

## Løsning

I `src/routes/index.tsx`:

- Skift wrapperen om `<MeasurementsTable>` fra `min-h-0 flex-1 pt-12` til en flex-container, der centrerer barnet vertikalt og giver lige meget luft top/bund samt sider, fx `min-h-0 flex-1 flex items-center justify-center px-6 py-10`.

I `src/components/stopwatch/MeasurementsTable.tsx`:

- Fjern `h-full` på `<section>` og `flex-1` på den indre scroll-container, så kortet får sin naturlige højde (men beholder `max-h` så det stadig kan scrolle hvis listen bliver lang). Konkret: `flex w-full flex-col` på section, og `max-h-full` i stedet for `flex-1` på scroll-div'en.

Dette gør at:
- Kortet kun fylder den højde dets indhold kræver, op til den tilgængelige plads.
- Flex-containerens `items-center` centrerer det vertikalt mellem knapperne og bunden.
- `px-6`/`py-10` giver luft til kanterne.

Sticky header virker stadig, fordi scroll-containeren beholder `overflow-y-auto` og `!overflow-visible` på `CollapsibleContent` er uændret.

## Verifikation

- Åbn `/`, bekræft at historik-kortet er vertikalt centreret mellem knap-området og bunden af siden med tydelig luft.
- Bekræft at lang liste stadig scroller inde i kortet med sticky header.
- Bekræft at tomt-tilstand ("Ingen registreringer endnu i dag") også er centreret.