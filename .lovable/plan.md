## Nyt layout for oversigtens header (fra skitse)

To rækker over kategori-kortene:

```
Række 1:                 [ Samlet tid: 6 t 40 min ]                    [ 🗑 Slet ]
Række 2:  [ ⌄ Fold alle ud ]                                    [ Vis som: hh:mm | timer ]
```

### `src/components/oversigt/DaySummary.tsx`
- Erstat den nuværende `flex justify-between`-struktur med to rækker:
  - **Række 1** (`relative flex items-center justify-center`):
    - "Samlet tid: X" centreret midt på siden.
    - "Slet"-knap absolut placeret yderst til højre (`absolute right-0`).
  - **Række 2** (`flex items-center justify-between`):
    - Venstre: "Fold alle ud / ind"-knap (eksisterende).
    - Højre: "Vis som"-ToggleGroup (flyttes fra nuværende plads).
- Tilføj `rightSlot` prop til "Slet"-knappen; behold `leftSlot` til "Fold alle".
- "Vis som"-toggle bliver intern i `DaySummary` (uændret styling), bare flyttet til række 2 højre.

### `src/components/oversigt/DaySummary.tsx` — labels
- Skift `<span className="text-xs text-muted-foreground">Vis som</span>` til at stå **før** togglen som i skitsen ("Vis som: hh:mm | timer").

### `src/routes/arkiv.tsx`
- Fjern de to separate `AlertDialog`-blokke ("Ryd historik" + "Ryd al historik").
- Erstat med **én** kombineret slet-knap → `rightSlot` på `DaySummary`:
  - Knap: `<Trash2 /> Slet` (kun synlig hvis `measurements.length > 0`).
  - Åbner én `AlertDialog` med to handlinger i footeren:
    - `Annuller`
    - `Slet dagens` (kalder `removeAllToday`, kun aktiv hvis `dayMeasurements.length > 0`)
    - `Slet alt` (kalder `removeAll`, destructive styling)
  - Dialogtitel: "Slet registreringer?"
  - Beskrivelse: "Vælg om du vil slette dagens registreringer eller samtlige registreringer på tværs af alle dage. Handlingen kan ikke fortrydes."

### Bevares
- Knapstilarter (ghost, size sm), hover-farver, toast-beskeder, `formatTotal`-output, eksisterende state og handlers.
- Memory-reglen: kun denne række ændres — kategori-kortene og historik-kortet på `/` rører vi ikke.

### Verifikation
- "Samlet tid" står visuelt centreret midt på siden uafhængigt af knappernes bredde.
- Kun ét trash-ikon ("Slet") i hele headeren, yderst til højre i række 1.
- Række 2 har "Fold alle" til venstre og "Vis som"-toggle til højre.
- Klik på "Slet" åbner én dialog med valg mellem "Slet dagens" og "Slet alt".