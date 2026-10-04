# Fem UI/UX-forbedringer

## Hvad ændres

1. **Kategoriskift uden spørgsmål** — Vælger du en ny kategori på en registrering i tabellen, skiftes den med det samme. Der vises en kort besked nederst: "Kategori ændret til Udvikling".
2. **"I dag"-knap i Oversigt** — Når du ser en anden dag end i dag, vises en lille "I dag"-knap ved datovælgeren. Ét klik bringer dig tilbage til i dag (som tasten T).
3. **Tom dag med handling** — Boksen "Ingen registreringer denne dag" får en knap "Tilføj tid for denne dag", som åbner tilføj-vinduet med den valgte dato.
4. **Tydelig pause** — Når stopuret står på pause, vises en rolig "Pauset"-mærkat over tallene, og tallene dæmpes en smule. Forsvinder når uret kører eller nulstilles.
5. **Slet én registrering med Fortryd** — Skraldespanden sletter straks, og beskeden "Registrering slettet" med **Fortryd** vises nederst i 5 sekunder. Fortryd genskaber registreringen. "Slet dagens" og "Slet alt" beholder deres bekræftelse.

## Teknisk

- `MeasurementsList.tsx`: fjern bekræftelsesdialoger for kategoriskift og enkelt-sletning; kald `onUpdate`/`onDelete` direkte. Toast ved kategoriskift.
- Fortryd ved sletning: i `index.tsx` og `arkiv.tsx` gemmes den slettede registrering, og `toast` med action kalder `add(draft)` med samme start/slut/kategori (ny id er acceptabelt). Fjern eksisterende "Registrering slettet"-toast i arkiv, så der kun vises én.
- `DateNavigator.tsx` (eller `arkiv.tsx`): "I dag"-knap, vist kun når valgt dato ikke er i dag.
- `arkiv.tsx`: knap i tom-tilstand der åbner `MeasurementDialog` med `baseDate={date}`.
- `Stopwatch.tsx`/`TimeDisplay.tsx`: "Pauset"-badge og `opacity-70` når uret har tid men ikke kører; brug semantiske tokens.
- `DESIGN.md`: notér at enkelt-sletning og kategoriskift ikke bekræftes, men kan fortrydes/rettes.
- Afprøv i testbrowser: kategoriskift, slet + Fortryd, I dag-knap, tom dag, pause-mærkat.
