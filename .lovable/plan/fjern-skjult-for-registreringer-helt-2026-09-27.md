# Fjern "skjult" for registreringer helt

Registreringer kan ikke længere skjules. Alle registreringer vises altid; man kan kun rette eller slette dem.

## Hvad ændres
- Kode: al skjul/genvis-logik fjernes (den bruges ikke i brugerfladen i dag).
- Eventuelle allerede skjulte registreringer bliver synlige igen i historik og arkiv.
- Databasen: kolonnen `hidden` på registreringer markeres som udfaset (bruges ikke længere). Den kan slettes permanent senere via SQL-editoren.

## Technical details
- `src/lib/measurements.functions.ts`: fjern `hidden` fra `MeasurementRow`, selects, insert og `updateSchema`; slet `hideMeasurementsInRange`; fjern `.eq("hidden", false)` i `removeMeasurementsInRange`.
- `src/hooks/use-measurements.ts`: fjern `hidden` fra typen/mapping, `hide`, `unhide`, `hideAllToday`, `hideRangeMut`, `hiddenAll`; `visibleToday` og `removeByDate`/`removeAllToday` filtrerer ikke længere på hidden (også preview-API).
- `src/routes/_authenticated/arkiv.tsx`: fjern `!m.hidden`-filtre.
- Migration (additiv): `COMMENT ON COLUMN public.measurements.hidden IS 'DEPRECATED: hide feature removed';` (default false bevares, så inserts virker).
- `categories.hidden` berøres ikke.
- Verificér build og at arkiv/forside viser alle registreringer.
