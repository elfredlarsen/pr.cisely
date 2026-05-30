## Problem
Når man holder musen over historik-headeren på `/`, dukker et lille lilla tooltip "Seneste registreringer" op. Tilsvarende headere på `/arkiv` (CategoryGroup) har ikke et tooltip — så det bryder 1:1-matchet og virker malplaceret.

## Løsning
Fjern tooltippet helt fra historik-headeren, så den opfører sig som kategori-headerne på oversigten.

### Ændringer i `src/components/stopwatch/MeasurementsTable.tsx`
- Fjern state og refs: `tipPos`, `tipVisible`, `showTimerRef`, `hideTimerRef`.
- Fjern handler-funktionerne: `clearShowTimer`, `clearHideTimer`, `handleHeaderEnter`, `handleHeaderMove`, `handleHeaderLeave`.
- Fjern `headerRowProps={{ onMouseEnter, onMouseMove, onMouseLeave }}` fra `<MeasurementsList />`.
- Fjern det flydende tooltip-`<div role="tooltip">` nederst i JSX og det omsluttende `<>` fragment (returnér `<section>` direkte).
- Fjern de nu ubrugte imports (`useRef`, `useState`, `MouseEvent`) hvis de ikke længere bruges (behold `useEffect`/`useState` til `format` og `open`).

### Uændret
- Sticky header, ikke-sortérbare overskrifter, foldbar `Collapsible`, localStorage-state, totaltid + antal i headeren.

## Verifikation
- Hover over historik-headeren på `/` viser intet tooltip længere.
- Headeren opfører sig visuelt og interaktivt som CategoryGroup-headeren på `/arkiv`.
