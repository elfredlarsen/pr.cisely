## Ændringer i `src/components/stopwatch/MeasurementsTable.tsx`

### 1. Blyant-ikon til venstre, ingen baggrundsændring ved hover
For både `renderTimeCell` og `renderDurationCell`:
- Flyt `<Pencil />` så den står før `<span>` i knappen.
- Fjern `hover:bg-accent` fra knappens className.
- Behold `group` + `opacity-0 group-hover:opacity-60` så kun ikonet ændrer sig ved hover.
- Juster layout til `justify-start gap-1.5` så blyanten ligger tæt til venstre for tallene.

### 2. Fast bredde på start-/sluttid uden uret
Problemet er at `<input type="time">` viser et indbygget ur/picker-ikon i browseren, som spiser plads og får layoutet til at hoppe. Løsning: erstat den med et tekst-input med samme masking-tilgang som varighed:

- Tilføj en `maskTime(input)`-hjælper der formaterer cifre som `HH:MM:SS` (svarende til `maskDuration`, men med max 6 cifre og time-grænse 23).
- I `renderTimeCell` udskift `<input type="time" step={1} ...>` med:
  ```
  <input
    type="text"
    inputMode="numeric"
    placeholder="00:00:00"
    value={draft}
    onChange={(e) => setDraft(maskTime(e.target.value))}
    ...
    className="h-8 w-28 ..."  // samme bredde som knap
  />
  ```
- Behold `parseTime` til commit — den accepterer allerede `HH:MM:SS`.

Resultat: ingen native ur-ikon, samme bredde (`w-28`) i både visnings- og redigeringstilstand, så layoutet er stabilt.

### Bevares uændret
- Bredderne: Start/Slut `w-28`, Varighed `w-24`.
- Alle andre stilarter, opaciteter og kategori-cellen.
