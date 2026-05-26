## Konsekvent tidsindtastning i "Gem registrering"

### Baggrund
Auto-genberegningen findes allerede i `FinishPanel.tsx` (handleStartChange/handleEndChange/handleDurationChange). Det der mangler er at indtastningsfelterne tvinger formatet HH:MM:SS, ligesom i tabellen.

### Ændringer i `src/components/stopwatch/FinishPanel.tsx`

1. **Starttid og Sluttid**: Skift fra `type="text"` til `type="time" step={1}`. Browseren tvinger HH:MM:SS-strukturen; brugeren kan kun ændre tallene.

2. **Varighed**: Behold `type="text"` men tilføj samme `maskDuration`-hjælper som i MeasurementsTable. Den indsætter automatisk koloner og tillader kun cifre. Kald den i `handleDurationChange` før `setDuration`.

3. **Bevar al eksisterende logik**: parse-funktioner, schema-validering, auto-genberegning, submit-flow er uændret.

### Verifikation
Manuel test af de samme scenarier:
- Start 08:00 + Slut 08:30 → Varighed opdateres til 00:30:00
- Ændr Varighed til 00:45 → Slut opdateres til 08:45, Start uændret