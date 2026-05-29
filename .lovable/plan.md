## Mål
1. Tomme tidsfelter (`--:--:--`) skal tolkes som `00:00:00` i stedet for at blive ignoreret.
2. Tom varighed skal tolkes som `0` (ingen varighed).
3. Tastaturgenveje under inline-redigering i arkivet:
   - **Esc** — annullér redigering (allerede implementeret, bevares).
   - **Cmd/Ctrl+Z** — fortryd ændringer i den åbne celle og sæt tilbage til oprindelig værdi (uden at lukke edit-mode).

## Ændringer

### `src/components/oversigt/format.ts`
- `parseTime(value, base)`: hvis `value` er tom streng → returnér `base` med `00:00:00` sat.
- `parseDuration(value)`: hvis `value` er tom streng → returnér `0`.
- `parseTimeToSec` (i CategoryGroup) opdateres tilsvarende: tom = `0`.

Live preview-handlere (`handleChangeStart/End/Duration`) genberegner allerede ud fra `parseTimeToSec` / `parseDuration`, så når tom = 0, opdateres varighed/slut korrekt i realtid.

### `src/components/oversigt/CategoryGroup.tsx`
- `commit()`: tillad `parseDuration` = 0 (fjern `> 0`-kravet) så varighed kan sættes til nul.
- Gem oprindelige værdier i `RowEdit` (tilføj `origStart`, `origEnd`, `origDuration`) ved `beginEdit`.
- I `handleKey`: tilføj `(e.metaKey || e.ctrlKey) && e.key === "z"` → nulstil `rowEdit` til de gemte oprindelige værdier (uden at lukke edit-mode, uden commit). Bevar Esc-adfærden (lukker edit-mode helt).

### Ingen øvrige filer berøres
Stopurets `MeasurementsTable` rører vi ikke. Toast-baseret "Fortryd skjul historik" påvirkes ikke.

## Teknik
- "Tom" defineres som `value.trim() === ""` (native `<input type="time">` med ryddet felt rapporterer `""`).
- Cmd/Ctrl+Z fanges kun mens en celle er i edit-mode; browserens standard undo bobler ikke videre (`preventDefault`).
- Shift+Cmd/Ctrl+Z (redo) gør intet — vi gemmer kun ét snapshot (den oprindelige værdi).