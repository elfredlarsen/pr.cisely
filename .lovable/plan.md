# Plan: Stopur-knapper og iOS-look

## 1. Stopur-knapper
- Alle tre knapper er lige store: 56 px høje, afrundede hjørner (12 px), og de deler bredden ligeligt.
- Faste pladser: Nulstil til venstre, Afslut i midten, Start/Pause/Fortsæt til højre. Før start vises Nulstil og Afslut dæmpede og kan ikke trykkes. Når du trykker Start, flytter ingen knapper sig.
- Farver som nu: Start/Fortsæt grøn, Pause blå, Afslut lilla, Nulstil lys sekundær knap.
- Glaseffekt: en tynd lys kant øverst, en svag glød nedad og en blød skygge. Nulstil får en frostet, let gennemsigtig flade.
- Ikonerne bliver 20 px.

## 2. Menulinjen
- Frostet, let gennemsigtig menulinje, der slører indholdet bag sig, med en tynd skillelinje nederst.

## 3. Kort og lister
- Kort i Indstillinger og Oversigt får blødere hjørner (16 px), en svag skygge og "grupperet liste"-udseende med bløde skillelinjer.
- Historikken på forsiden følger Oversigtens udseende 1:1 (gemt regel).

## 4. Popups og felter
- Dialoger får 20 px hjørner og sløret baggrund bag sig.
- Inputfelter og almindelige knapper får lidt blødere hjørner.
- Lyst og mørkt tema virker begge.

## Teknisk
- `src/styles.css`: tokens `--radius` hævet, `--shadow-glass`, `--glass-highlight`; utility `.glass-surface` (kun standard `backdrop-filter`, ingen `-webkit-`).
- `Stopwatch.tsx`: én fast 3-knaps række; `idle` viser Nulstil/Afslut `disabled` + `opacity-30`; alle `flex-1 basis-0 h-14 rounded-xl`; højre knap skifter indhold.
- `TopNav.tsx`: `bg-background/70 backdrop-blur-xl border-b border-border/60`.
- `ui/dialog.tsx`, `ui/alert-dialog.tsx`: `rounded-2xl`, overlay `backdrop-blur-sm`.
- `MeasurementsTable.tsx`, `MeasurementsList.tsx`, `indstillinger.tsx`, `oversigt.tsx`: `rounded-2xl`, bløde skillelinjer.
- `DESIGN.md`: opdatér knapform og glas-regler.
- Kontrollér med testbrowser i lyst og mørkt tema.
