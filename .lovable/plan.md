## Problem

Kommentarknappen i `MeasurementsList.tsx` (linje 465–488) bruger `size="icon"` som låser knappen til `h-9 w-9` (36×36 px). Men knappen indeholder **to** glyffer: `MessageSquare` (16 px) + `ChevronRight` (12 px), så indholdet flyder ud over knappens boks vandret. Hover-baggrunden (`hover:bg-[#c471ed]/25`) tegnes kun inde i de 36×36 px, så chevronen stikker ud uden baggrund — det ligner at hover-boksen ikke dækker hele knappen.

## Løsning

I `src/components/measurements/MeasurementsList.tsx` på kommentarknappen:

- Fjern `size="icon"` (eller behold default) og brug i stedet en egen størrelse der tilpasser sig indholdet: `className="relative h-9 w-auto px-2 gap-0.5 ..."` så baggrunden omslutter både ikon, prik og chevron.
- Bevar `aria-label`, `aria-expanded`, prikken og chevron-rotationen uændret.

Ingen ændringer i andre filer eller funktionalitet.
