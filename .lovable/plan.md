## Problem

Tabel-headeren ("Start / Slut / Varighed / Kategori") i historikken på stopursforsiden er ikke længere sticky, når man scroller i listen.

Årsag: Tabellen er wrappet i Radix `CollapsibleContent`, som sætter `overflow: hidden` (inline). `position: sticky` virker ikke, når en mellemliggende forfader har `overflow: hidden` — den klippes væk i stedet for at flyde over toppen af scroll-containeren.

## Løsning

I `src/components/stopwatch/MeasurementsTable.tsx`:

- Tilføj `!overflow-visible` til `CollapsibleContent` (overskriver Radix' inline `overflow: hidden`), så `sticky` virker op til den ydre scroll-container (`overflow-y-auto` div'en).

Ingen ændringer i `MeasurementsList.tsx` — den har allerede `stickyHeader` korrekt sat.

## Verifikation

- Åbn `/`, opret nogle målinger, scroll i historik-listen og bekræft at tabel-header bliver klistret til toppen af kort-området.
- Bekræft at åbn/luk-animationen på Collapsible stadig fungerer pænt.