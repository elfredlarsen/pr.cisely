## Diagnose
Sletknapperne blev sat til `h-9 w-12` (historik/arkiv) og `h-8 w-11` (admin) — kun 12 px bredere end før. Forskellen er sandsynligvis for subtil til at være synlig, især ved siden af kommentar-knappen. `cn`/`twMerge` håndterer override af `size="icon"`s `w-9`/`w-8`, så ændringen er aktiv — den er bare for lille.

## Ændringer
Øg bredden tydeligt så knapperne fremstår mærkbart bredere (men stadig kvadratisk-agtige).

**`src/components/measurements/MeasurementsList.tsx`** (historik + arkiv)
- Sletknap: `h-9 w-12` → `h-9 w-16` (36×64).

**`src/routes/_authenticated/admin.tsx`** (admin)
- Sletknap: `h-8 w-11` → `h-8 w-14` (32×56).
- Omdøb-knap: `h-8 w-11` → `h-8 w-14` (for visuel konsistens).

Ingen ændringer i ikon, varianter, tooltips eller funktionalitet.
