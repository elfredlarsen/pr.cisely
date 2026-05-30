## Plan

Match historiktabellens visuelle styling 1:1 med oversigttabellen (CategoryGroup), fjern opaciteten, men behold sticky header og ikke-sortérbare overskrifter.

### Ændringer
Fil: `src/components/stopwatch/MeasurementsTable.tsx`

- Fjern `opacity-75` fra `<section>` (historikken vises nu med fuld opacitet).
- Skift `border-border/60` → `border-border` på:
  - Empty-state-containeren (`rounded-lg border ...`).
  - `<Collapsible>` wrapper-klasser.
  - `<CollapsibleContent>`'s indre div (`border-t border-border/60` → `border-t border-border`).
- Behold alt andet uændret: sticky header, `sortable={false}`, `headerRowProps` (tooltip), localStorage-state for åben/lukket, samlet tid + antal i headeren.

### Opdater hukommelse
- Den tidligere regel "behold opacity-75 på historikken" er nu omgjort af brugeren. Opdater `mem://` så fremtidige sessioner ved, at historikken IKKE skal have nedsat opacitet, og at den visuelt skal følge CategoryGroup-stilen.

### Verificering
- Tjek `/`: historikkens container og fold-out header har samme border-farve, baggrund og padding som CategoryGroup på `/arkiv`.
- Bekræft at sticky header stadig virker ved scroll og at overskrifterne ikke er klikbare.
