# Fjern offline-køen helt

## Hvad brugeren oplever
- Når man trykker "Gem" (fra stopuret) eller "Gem" i "Tilføj registrering", bliver vinduet stående, mens der gemmes (knappen viser "Gemmer…" og kan ikke trykkes igen).
- Lykkes det: vinduet lukker, stopuret nulstilles (kun ved stopur-gem), og der vises "Registrering gemt".
- Mislykkes det: vinduet forbliver åbent med den stoppede tid, start/slut og valgte kategori uændret, og en tydelig rød fejltekst vises i vinduet, fx "Registreringen kunne ikke gemmes. Tjek din internetforbindelse og prøv igen." Stopuret nulstilles ikke. Brugeren kan trykke "Gem" igen.
- Den lille synk-indikator i menulinjen fjernes helt.
- Gamle ventende registreringer i browseren slettes uden forsøg på at gemme dem.

## Ændringer
1. Slet `src/lib/offline-queue.ts` og `src/components/stopwatch/SyncStatus.tsx`; fjern `<SyncStatus />` fra `TopNav.tsx`.
2. `src/hooks/use-measurements.ts`:
   - Fjern kø-import, `queuedDrafts`, sammenfletning med servermålinger, `syncOne`/`syncAll`, online/focus-lyttere, interval, og `tmp-`-håndtering i `update`/`remove`.
   - `add(draft)` returnerer et Promise, der kalder serverens create-funktion direkte (`mutateAsync`), invaliderer listen ved succes og kaster fejl videre ved fejl. Preview-tilstand uændret (returnerer resolved Promise).
   - Ved mount: `localStorage.removeItem("precisely.offline-queue.v1")` én gang.
3. `src/components/oversigt/MeasurementDialog.tsx`:
   - `onSave` må returnere Promise; `handleSubmit` bliver async, sætter `saving`, awaiter `onSave`, lukker kun ved succes; ved fejl sættes `error` til den danske fejltekst og vinduet bliver åbent med alle felter.
   - Gem-knap disabled + "Gemmer…" under gem.
4. `src/routes/_authenticated/index.tsx`: `handleSave`/`handleAddSave` awaiter `add`; `setPending(null)`, `resetStopwatch()` og toast kun ved succes. Fjern `setAddOpen(false)` (dialogen lukker selv).
5. Tjek øvrige kaldere af `add`/`MeasurementDialog` (fx arkiv) og tilpas til samme mønster.

## Teknisk
- Fejltekst i dialogen bruger eksisterende `role="alert"` + `text-destructive`.
- Ingen databaseændringer.
- Verificér med build-log og `rg "offline-queue|SyncStatus|TEMP_ID_PREFIX" src` = ingen træf.
