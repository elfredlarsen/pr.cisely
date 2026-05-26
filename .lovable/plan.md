## Ændringer

**1. `src/components/stopwatch/Stopwatch.tsx**`

- Fjern den nuværende `useEffect` (linje 145-151), der nulstiller uret når `finishOpen` går fra `true → false`. Den nulstilling skal kun ske ved Gem, ikke ved Annuller.
- Når `finishOpen === true`, tilføj visuel dæmpning på sektionen: `opacity-50`, `pointer-events-none`, `aria-hidden="true"` + en blød `transition-opacity duration-200`. Uret tæller stadig i baggrunden (RAF-loopet kører videre), men er visuelt nedtonet og ikke-interaktivt.

**2. `src/routes/index.tsx**`

- Tilføj en ny prop til `<Stopwatch>` (fx `onSaved` eller eksplicit `resetSignal`), så nulstilling kun trigges fra `handleSave` — ikke fra `handleCancel`.
- Enklere alternativ: behold den eksisterende `finishOpen`-baserede reset, men gør den betinget. Konkret: tilføj en `resetAfterClose`-prop (boolean), som `index.tsx` sætter til `true` lige før `setPending(null)` i `handleSave`, og `false` i `handleCancel`. Stopwatch læser denne prop i sin "finishOpen turns false"-effekt.

Foretrukken løsning: erstat `finishOpen`-baseret reset med en eksplicit imperativ trigger. Tilføj `resetKey: number` prop til `Stopwatch`. `index.tsx` inkrementerer `resetKey` kun i `handleSave`. `Stopwatch` kører `dispatch({ type: "RESET" })` i en effect på `[resetKey]` (skipper første render).

## Adfærd efter ændringen

- **Afslut klikkes** → dialog åbner, ur dæmpes visuelt (opacity 50%), tæller fortsat i baggrunden.
- **Annuller** → dialog lukkes, ur går tilbage til fuld opacity og fortsætter med at tælle uden afbrydelse.
- **Gem** → dialog lukkes, ur nulstilles til `idle` (0:00).

## Tilgængelighed

- `aria-hidden="true"` og `pointer-events-none` på det dæmpede ur, så skærmlæsere og keyboard-fokus hopper det over mens dialogen er åben.
- Tastaturgenveje i `Stopwatch` ignorerer allerede input når `finishOpen` er true (linje 162) — beholdes.