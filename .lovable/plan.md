## Mål

Da varighed nu er begrænset til under 24 timer, kan alle tre felter (Starttid, Sluttid, Varighed) bruge samme native `<input type="time" step={1}>`. Det giver ensartet UX: samme spinner, samme tastaturnavigation, samme udseende.

## Ændringer

### `src/components/stopwatch/FinishPanel.tsx`
- Varighedsfeltet skiftes fra `type="text"` + `maskDuration` til `type="time" step={1}` (format `HH:MM:SS`, maks `23:59:59`).
- Fjern lokal `maskDuration`-funktion.
- `handleDurationChange` forenkles: parse direkte `HH:MM:SS`, opdater sluttid som før.
- Validering: hvis sluttid ville overskride `23:59:59` (samme dag), vis fejl "Varighed for stor (maks 24 timer)".

### `src/components/oversigt/MeasurementDialog.tsx`
- Samme ændring: varighed bliver `type="time" step={1}`.
- Fjern lokal `maskDuration`.

### `src/components/oversigt/format.ts`
- `parseDuration` strammes til maks `23:59:59` (regex `^(\d{1,2}):(\d{2}):(\d{2})$` og afvis h > 23). `maskDuration` kan fjernes hvis ingen længere bruger den; ellers bevares.

### `src/components/oversigt/CategoryGroup.tsx` (inline-redigering af varighed)
- Hvis varighedscellen redigeres som tekstfelt med maske, ændres den ligeledes til `type="time" step={1}` for konsistens. (Bekræftes ved gennemlæsning før implementering.)

## Det der IKKE ændres
- Datamodel: `ms` forbliver millisekunder; ingen migration nødvendig (eksisterende data er allerede < 24 t i praksis, men hvis nogen findes >= 24 t vil de vises afkortet i input — vi accepterer det).
- Kategorier, kommentar-funktion, fortryd-omfang.

## Resultat
Alle tre felter ser ens ud og opfører sig ens. Ingen custom maske-logik. Brugeren kan ikke længere indtaste varigheder ≥ 24 t.
