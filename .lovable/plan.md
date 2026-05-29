## Mål

`MeasurementsTable` (historikken under stopuret) får samme UI og opførsel som tabellen i `CategoryGroup` (Oversigt). Den eneste forskel der bevares er `opacity-75` på sektionen.

## Hvad ændres

Historik-tabellen får fra Oversigten:

1. **Sorterbare kolonneoverskrifter** (Start / Slut / Varighed) med op/ned-pile via samme `renderSortHeader`-mønster. Default sortering: `start` asc.
2. **Række-redigeringsmodel**: klik på et tidsfelt sætter hele rækken i edit-mode, lilla baggrund (`bg-[#c471ed]/15`), og start/slut/varighed er **linkede** — ændring i ét felt opdaterer det relaterede (start↔varighed, slut↔varighed). Cmd/Ctrl+Z nulstiller rækken til originale værdier. Enter committer, Esc annullerer.
3. **Kategori-skift med bekræftelsesdialog** (samme `pendingCategoryChange` flow med "Skift kategori fra X til Y?").
4. **Kommentar-række for "andet"**: når kategori er `andet`, vises en ekstra række under hovedrækken med kommentaren (klikbar for at redigere, samme inline textarea-mønster).
5. **Slet-knap** med `AlertDialog` ("Slet registrering?") — allerede ensrettet i sidste tur, beholdes.
6. **Cellestyling, række-hover, blyant-ikon, tabular-nums, højder** — alt overtages 1:1.

## Hvad bevares fra historikken

- `section` wrapper med `opacity-75`.
- Scroll-container (`scrollbar-purple ... overflow-y-auto`) — historikken er rullbar.
- Sticky table header (`sticky top-0 bg-card`) — relevant pga. scroll.
- **"Ryd historik"-knappen** i header-rækkens højre kolonne (med den nye "Slet alle dagens registreringer?"-dialog). Bulk-handling findes ikke i Oversigten, men er nyttig her — bevares medmindre du siger andet.
- Hover-tooltip på header-rækken ("Seneste registreringer").
- De faste kolonnebredder (`w-[7rem]` på tidskolonner, `w-auto` på Kategori) — ensartet med Oversigten allerede.

## Strategi

For at undgå duplikeret logik **udtrækkes** række-redigerings- og kategori-/kommentar-logikken fra `CategoryGroup` til en delt komponent:

```
src/components/measurements/MeasurementRow.tsx
```

Den indeholder:
- `renderTimeCell` / `renderDurationCell` med linkede inputs
- Kategori-Select + bekræftelsesdialog
- Kommentar-række for `andet`
- Slet-knap + dialog
- `useState` for `rowEdit`, `commentEdit`, `pendingCategoryChange` (lokal til rækken — flyttes til komponenten så hver række håndterer sin egen state)

`CategoryGroup` og `MeasurementsTable` bliver så tynde wrappers der:
- Bygger header-rækken (sorterbar i begge, men `CategoryGroup` har ingen ekstra action-kolonne; `MeasurementsTable` har "Ryd historik"-cellen).
- Render'er rækker via `<MeasurementRow>`.
- Holder sort-state lokalt.

Det giver én sandhed for række-UI og fremtidige ændringer rammer begge steder.

### Filer der ændres

1. **Ny:** `src/components/measurements/MeasurementRow.tsx` — udtrukket fra `CategoryGroup`.
2. **`src/components/oversigt/CategoryGroup.tsx`** — bruger `MeasurementRow`, beholder sort + collapsible + total-header.
3. **`src/components/stopwatch/MeasurementsTable.tsx`** — bruger `MeasurementRow`, beholder `opacity-75`, scroll, sticky header, "Ryd historik".
4. **`src/hooks/use-measurements.ts`** — `update` bruges allerede begge steder, ingen ændringer.

## Hvad ikke ændres

- Logik for `add` / `update` / `remove` / `removeAllToday`.
- `useMeasurements` API.
- Designtokens, farver (samme `#c471ed`-accent).
- Sider/ruter.
- Dialog-komponenter (`MeasurementDialog`, `FinishPanel`).

## Verifikation

I preview tjekkes på `/` (Stopur):
1. Historikken har sorterbare overskrifter med pile.
2. Klik på et tidsfelt sætter hele rækken i lilla edit-mode; start/slut/varighed er linkede.
3. Kategori-skift viser bekræftelsesdialog.
4. Andet-kategori viser kommentar-række.
5. Slet-knap åbner samme bekræftelsesdialog som i Oversigten.
6. Hele sektionen er stadig `opacity-75`.
7. "Ryd historik"-knappen findes stadig øverst til højre og sletter dagens registreringer permanent.

Og på `/arkiv` (Oversigt):
8. Ingen visuel/funktionel regression — tabellen ser ud og opfører sig præcis som før refaktoreringen.
