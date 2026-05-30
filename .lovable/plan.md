Begræns historik-scrollområdet til ca. 7 rækker.

**Ændring** i `src/components/stopwatch/MeasurementsTable.tsx`:
- På scroll-containeren (linje 95) erstattes `flex-1 min-h-0` med en fast `max-h` svarende til ~7 rækker. Rækker er `h-8` med `py-1` ≈ 40 px hver, plus sticky header på ~40 px → `max-h-[20rem]` (320 px) rummer header + 7 rækker. Overflow forbliver `overflow-y-auto` med eksisterende `scrollbar-purple`.
- Fjerner `data-[state=open]:h-full` og `data-[state=open]:flex-1` så Collapsible-indholdet ikke længere prøver at fylde hele forældrehøjden — den kollapser naturligt til content-højden, op til max.

Ingen ændringer i logik, sortering eller styling af selve tabellen.