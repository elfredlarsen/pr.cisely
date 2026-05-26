## Mål
1. Tydeligere hover-tilstand på alle stopur-knapper.
2. Tooltip på hver knap med navn + tastaturgenvej.

## Tooltips
Bruger eksisterende `Tooltip` (Radix) fra `src/components/ui/tooltip.tsx`. Pakker knap-rækken i `Stopwatch.tsx` i én `TooltipProvider` og hver knap i `Tooltip`/`TooltipTrigger asChild`/`TooltipContent`.

Tooltip-indhold matcher de faktisk implementerede genveje (ikke "P"):

| Knap     | Tooltip               |
|----------|-----------------------|
| Start    | Start · `Mellemrum`   |
| Pause    | Pause · `Mellemrum`   |
| Fortsæt  | Fortsæt · `Mellemrum` |
| Nulstil  | Nulstil · `N`         |
| Afslut   | Afslut · `A`          |

Genvejen vises som lille `<kbd>`-chip i tooltippen for læsbarhed. Tilføjer desuden `aria-keyshortcuts` på hver knap (` `, `N`, `A`) så skærmlæsere kender genvejen uden hover. Tooltip-tekst er på dansk og respekterer den eksisterende tone.

## Tydeligere hover
Opdaterer `baseBtn` + varianterne i `Stopwatch.tsx`:

- Stærkere farveskift via `hover:brightness-110` (mørke knapper bliver tydeligt lysere; outline-knapper får `hover:bg-muted` + `hover:border-foreground/40`)
- `hover:shadow-md` for løft i dybden
- Let fysisk respons: `motion-safe:hover:-translate-y-0.5` + `motion-safe:active:translate-y-0` med `transition-all duration-150`
- Tydeligere kant: `hover:ring-2 hover:ring-foreground/15 ring-offset-2 ring-offset-background`
- Bevarer eksisterende `focus-visible:ring-2` (tastaturfokus uændret)
- `motion-safe:`-prefix sikrer at `prefers-reduced-motion` deaktiverer transform

## Filer
- `src/components/stopwatch/Stopwatch.tsx` — wrap knapper i Tooltip, tilføj `aria-keyshortcuts`, opdater knapklasser.

Ingen ændringer i logik, genvejs-handlere, datalag eller andre filer.
