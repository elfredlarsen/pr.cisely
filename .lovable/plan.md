## Ændringer

### 1. Tooltip-forsinkelse
- **Fil:** `src/components/stopwatch/Stopwatch.tsx`
- **Linje 169:** Ændr `delayDuration` fra `1500` til `1000` ms.

### 2. Fjern hop fra knap-hover
- **Fil:** `src/components/stopwatch/Stopwatch.tsx`
- **Linje 57:** Fjern `motion-safe:hover:-translate-y-0.5` og `motion-safe:active:translate-y-0` fra `baseBtn`. Bevar øvrige hover-effekter (skygge, ring, brightness).