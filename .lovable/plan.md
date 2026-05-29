## Mål
Gør inline redigering af tider mere intuitiv ved at linke felterne, som i `MeasurementDialog`:
- Ændrer man **start** → varighed justeres (slut fast).
- Ændrer man **slut** → varighed justeres (start fast).
- Ændrer man **varighed** → slut justeres (start fast).

I dag ændres kun det felt brugeren redigerer, hvilket føles brudt.

## Ændringer

### `src/components/oversigt/CategoryGroup.tsx` — `commit()`-funktionen

Aktuel adfærd (linje 81–105) opdaterer allerede de afledte felter korrekt:
- **start** → `endedAt` fast, `ms` = end − newStart ✓
- **slut** → `startedAt` fast, `ms` = newEnd − start ✓
- **varighed** → `startedAt` fast, ny `endedAt` = start + ms ✓

Logikken er altså allerede linket — problemet er at brugeren ikke kan se det, fordi den native `<input type="time">` skjuler de andre cellers værdier indtil commit. Tilføj derfor en **live preview** under redigering:

1. Hold lokal state for hele rækken mens den redigeres (start/end/duration som strenge), initialiseres ved `beginEdit`.
2. Når et af felterne ændres, opdatér de to andre cellers viste værdi i realtid:
   - `start` ændres → genberegn `duration` ud fra nuværende `end`.
   - `end` ændres → genberegn `duration` ud fra nuværende `start`.
   - `duration` ændres → genberegn `end` ud fra nuværende `start`.
3. De to ikke-aktive celler viser disse afledte preview-værdier (read-only) i stedet for de gemte værdier, mens rækken er i edit-mode.
4. `commit` gemmer alle tre konsistente værdier i ét `onUpdate`-kald.
5. Esc/blur uden gyldig ændring → kasserer preview, viser gemte værdier.

Validering bevares (Esc = annuller, ugyldig = ingen ændring). Negativ varighed afvises (vis ikke et negativt preview — fald tilbage til "—").

### Ingen øvrige filer berøres
Stopurets `MeasurementsTable` ligger urørt — kun arkivets tabel ændres som aftalt tidligere.
