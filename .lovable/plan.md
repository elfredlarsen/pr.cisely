# Hærd measurements-autorisation (defense-in-depth)

## Status på database
RLS er allerede aktiveret på `public.measurements`, og de fire policies (select/insert/update/delete) begrænser allerede rækker til `auth.uid() = user_id`. **Ingen migration nødvendig** — kravet er allerede opfyldt.

## Kodeændringer
Kun én fil: `src/lib/measurements.functions.ts`. Tilføj `.eq("user_id", context.userId)` som ekstra defense-in-depth-lag (oven på RLS) i fem handlers. Ingen ændringer i signaturer, validering, returtyper eller fejlhåndtering.

### Ændringer

1. **`listMeasurements`** — tilføj `.eq("user_id", userId)` til select-kæden (destructure `userId` fra context).
2. **`updateMeasurement`** — tilføj `.eq("user_id", userId)` til update-kæden ud over `.eq("id", id)`.
3. **`deleteMeasurement`** — tilføj `.eq("user_id", userId)` til delete-kæden ud over `.eq("id", data.id)`.
4. **`removeMeasurementsInRange`** — tilføj `.eq("user_id", userId)` til delete-kæden.
5. **`hideMeasurementsInRange`** — tilføj `.eq("user_id", userId)` til update-kæden.

`createMeasurement` og `removeAllMeasurements` røres ikke (de bruger allerede `userId` korrekt).

## Effekt
- UI og funktionalitet uændret.
- Hvis RLS nogensinde skulle misconfigureres eller en bug giver bredere context, vil queries stadig være låst til ejerens rækker.
