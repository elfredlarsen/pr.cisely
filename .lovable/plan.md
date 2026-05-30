## Mål
Sletknapperne i tabellerne er for smalle. Gør dem bredere så de bliver kvadratiske eller næsten kvadratiske, mens ikonet og højden bevares.

## Ændringer

**`src/components/measurements/MeasurementsList.tsx`** (historik/arkiv-tabel)
- Sletknap (linje 498): `h-9 w-9` → `h-9 w-12` (36×48, lidt bredere end høj).

**`src/routes/_authenticated/admin.tsx`** (kategori-tabel)
- Sletknap (linje 269): `h-8 w-8` → `h-8 w-11` (32×44).
- For konsistens i samme rækkes handlingsgruppe gøres Omdøb-knappen (linje 255) tilsvarende bredere: `h-8 w-8` → `h-8 w-11`.

Ingen ændringer i ikonstørrelse, varianter, tooltips eller funktionalitet.
