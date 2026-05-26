## Tabelrække-fremhævning

### Baggrund
Brugeren ønsker bedre visuel feedback i målingstabellen:
1. Tydelig hover-fremhævning af rækker (i stedet for den nuværende neutrale `hover:bg-muted/50`).
2. Hele rækken skal markeres visuelt når brugeren redigerer et felt i den.

### Ændringer

**Fil: `src/components/stopwatch/MeasurementsTable.tsx`**

1. **Hover-fremhævning på datarækker**
   - På hver `<TableRow>` i `measurements.map()` tilføjes `hover:bg-[#c471ed]/10` til `className`. Dette erstatter/overskriver den neutrale `hover:bg-muted/50` fra `ui/table.tsx`.
   - Bevarer `transition-colors` for blød overgang.

2. **Aktiv markering under redigering**
   - Tilføj hjælperfunktion `isRowEditing(m: Measurement)` der returnerer `true` hvis `editing?.id === m.id`.
   - Når en række er aktiv (redigering pågår), tilføjes `bg-[#c471ed]/15` til rækken — en anelse stærkere end hover, så den er tydelig selv uden musen over.
   - Hover-stil og aktiv-stil kombineres med `cn()`: når aktiv vises kun den stærkere baggrund; ellers den lette hover.

3. **Ingen ændringer**
   - Header-rækken (`TableHeader`) beholdes uændret.
   - Tooltips, knapper, logik, og øvrig tabelfunktionalitet påvirkes ikke.
   - `ui/table.tsx` ændres ikke — overskrivningen sker via `className` prop på de enkelte rækker.