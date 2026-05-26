## Fjern hundrededele fra stopurets visning

Stopurets hovedvisning (`src/components/stopwatch/TimeDisplay.tsx`) viser i dag `MM:SS:hh`. Hundrededele fjernes; formatet skifter dynamisk mellem `MM:SS` og `HH:MM:SS`.

### Ændringer i `TimeDisplay.tsx`
- `formatTime(ms)` returnerer én streng:
  - Under 60 minutter: `MM:SS`
  - 60 minutter eller mere: `HH:MM:SS`
- Fjern al hundrededele-logik (`hundredths`-beregning, -felt og -span).
- Begge formater rendres i samme store skriftstørrelse (samme `text-[clamp(...)]`-klasse som i dag).
- Opdater `sr-only`-tekst:
  - `MM:SS` → "{minutter} minutter og {sekunder} sekunder"
  - `HH:MM:SS` → "{timer} timer, {minutter} minutter og {sekunder} sekunder"

### Ikke berørt
- `Stopwatch.tsx`, historiktabellen og parsning/maskering forbliver uændret. Historiktabellens varighedsfelt viser allerede `HH:MM:SS` uden hundrededele.
