## Mål

Ensart designet af de to tabeller:
- **Oversigten** (`CategoryGroup` i `/arkiv`): har allerede bløde runde kanter (kort med `rounded-lg border bg-card`), men inputfelterne er smallere (`w-24`) så `<input type="time" step={1}>` afkorter visningen, når man klikker.
- **Historikken** (`MeasurementsTable` på `/`): har bredere inputfelter (`w-28`) så hele tidsværdien er synlig, men mangler kortramme og bløde kanter.

Resultat: Begge skal have samme kortramme og samme inputbredde. Historikken skal stadig være visuelt nedtonet (mindre fokus).

## Ændringer

### `src/components/oversigt/CategoryGroup.tsx`
- I `renderTimeCell` og `renderDurationCell`: ændr `w-24` → `w-28` på både input og knap, så hele `HH:MM:SS` + spinner er synlig.
- Opdater tilsvarende kolonnebredder i `<TableHead>` for Start/Slut/Varighed fra `w-24` → `w-28`.

### `src/components/stopwatch/MeasurementsTable.tsx`
- Wrap tabellen i en kortramme magen til Oversigten: `rounded-lg border border-border bg-card` omkring `<Table>` (inde i den eksisterende scroll-container, eller som dens container).
- Behold den nedtonede karakter: bevar `opacity-75` på sektionen, og brug evt. lidt blødere border (`border-border/60`) så historikken stadig træder mindre frem end Oversigten.
- Ingen ændring af bredder (allerede `w-28` / `w-24`).
- "Ryd historik"-knappen og sticky header skal stadig fungere inden i kortet — sticky `top-0` beholdes; kortets `overflow-hidden` undgås så den sticky header virker.

## Det der IKKE ændres
- Funktionalitet, kategorier, kommentar, sortering, redigering.
- Farver/temaer ud over evt. en svagere border på historikken.
- `opacity-75` på historikken bevares som primær nedtoningsmekanisme.

## Resultat
Begge tabeller har samme bløde kortramme. Begge har inputfelter brede nok til at vise hele tidsværdien ved klik. Historikken er stadig tydeligt sekundær via opacity (og evt. svagere kant).
