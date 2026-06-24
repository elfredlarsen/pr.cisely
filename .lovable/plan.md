## Problem
På `/` viser stopuret tre knapper (Nulstil, Afslut, Pause/Fortsæt) når det kører/er pauset. Knapperne wrapper nu til to rækker (Nulstil + Afslut øverst, Pause nederst) i stedet for at stå pænt fordelt på én række under uret.

Årsagen er at knap-rækken bruger `flex-wrap` og `flex-1 basis-0` på hver knap. Når knapperne får for meget min-bredde fra deres indhold (ikon + tekst med `text-xl`), wrapper de.

## Løsning
I `src/components/stopwatch/Stopwatch.tsx`, knap-gruppen (`role="group"`):

- Skift `flex-wrap` → `flex-nowrap` så de tre knapper altid står på én linje.
- Behold `flex-1 basis-0 min-w-0` på hver knap, så de deler bredden ligeligt (matcher urets bredde via `clockWidth`).
- Reducer evt. `gap-3` → `gap-2` og knappens `px-5` → `px-3` for at give plads på smalle viewports.
- Ingen ændringer til `idle`-tilstanden (kun Start-knap).

Kun præsentation ændres — ingen ændringer i logik, context eller andre filer.