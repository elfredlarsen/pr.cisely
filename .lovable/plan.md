## Flyt Slet-knap ned under kategori-tabellen — højrejusteret

### `src/routes/arkiv.tsx`
- Fjern `rightSlot={...}` (hele Slet-`AlertDialog`-blokken) fra `<DaySummary />`.
- Omstrukturér den eksisterende `mt-6 flex justify-center`-række så "Tilføj registrering" forbliver visuelt centreret midt på siden, og "Slet" placeres yderst til højre på samme linje:

```
              [ + Tilføj registrering ]                       [ 🗑 Slet ]
```

Konkret markup (3-spaltet grid så center er sand-centreret uafhængigt af knappernes bredde):

```tsx
<div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
  <div />
  <Button …>+ Tilføj registrering</Button>
  <div className="justify-self-end">
    {measurements.length > 0 && (
      <AlertDialog>…Slet…</AlertDialog>
    )}
  </div>
</div>
```

- "Slet"-knappen bevarer nuværende styling (ghost, `min-h-9`, hover destructive).
- Dialogen (Slet dagens / Slet alt) er uændret.

### `src/components/oversigt/DaySummary.tsx`
- Fjern `rightSlot`-prop og den absolut-positionerede højre-container i række 1.
- Række 1: `flex items-center justify-center` med "Samlet tid: X" centreret.
- Række 2 ("Fold alle" + "Vis som") uændret.

### Bevares
- "Samlet tid" centreret, "Fold alle" venstre, "Vis som" højre.
- Toast-beskeder, handlers, `removeAllToday` / `removeAll`.

### Verifikation
- Ingen Slet-knap i DaySummary-headeren.
- Under kategori-kortene: "Tilføj registrering" centreret, "Slet" yderst til højre.
- Klik på "Slet" åbner dialogen med valg mellem dagens og alt.