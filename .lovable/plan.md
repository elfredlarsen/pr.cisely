## Brug `MeasurementDialog`-UI til "Gem registrering" på forsiden

Forsidens `FinishPanel` er en inline-card oven på stopuret. Oversigtens `MeasurementDialog` er en rigtig modal (shadcn `Dialog` med overlay, centreret kort, X-luk, ESC-luk, focus-trap). Forretningslogikken (felter, validering, kategori, kommentar, varigheds-synk) er stort set ens.

Vi genbruger `MeasurementDialog` til at gemme stopurets måling og fjerner `FinishPanel`.

### `src/components/oversigt/MeasurementDialog.tsx`
- Tillader allerede `initial` (start/slut/varighed/kategori/kommentar) og `title`. Ingen ændringer nødvendige — vi bruger den som den er.

### `src/routes/index.tsx`
- Fjern import af `FinishPanel`.
- Importér `MeasurementDialog` fra `@/components/oversigt/MeasurementDialog`.
- Erstat den absolut-positionerede `<FinishPanel … />`-overlay-blok (linje 68–79) med:
  ```tsx
  <MeasurementDialog
    open={pending !== null}
    onOpenChange={(o) => { if (!o) handleCancel(); }}
    baseDate={pending?.startedAt ?? new Date()}
    initial={pending ? {
      startedAt: pending.startedAt.toISOString(),
      endedAt: pending.endedAt.toISOString(),
      ms: pending.endedAt.getTime() - pending.startedAt.getTime(),
      category: getLastCategory(),
    } : undefined}
    onSave={(draft) => { handleSave(draft); }}
    title="Gem registrering"
  />
  ```
- `handleSave` lukker `pending` (kald `setPending(null)` / nuv. flow), så dialogen lukker automatisk via `open={pending !== null}`.
- Bevarer `Stopwatch` med `finishOpen={pending !== null}` (uændret prop).
- Importér `getLastCategory` fra `@/lib/categories` til at sætte initial-kategori.

### `src/components/stopwatch/FinishPanel.tsx`
- Slet filen — bruges ikke længere.

### Bevares
- Stopurets eksisterende start/stop/reset-logik, `pending`-state, `handleSave`, `handleCancel`, `resetKey`.
- `setLastCategory` håndteres allerede inde i `MeasurementDialog.handleSubmit`.

### Verifikation
- Stop stopuret → modal dukker op centreret med overlay og samme UI som "Tilføj registrering" på `/arkiv`.
- ESC eller X lukker dialogen og annullerer (kalder `handleCancel`).
- Gem indsætter måling som før og nulstiller stopuret.