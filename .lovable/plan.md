## Mål

Gør hover tydeligere på det specifikke element man peger på (celle/knap), ikke kun på hele rækken.

## Ændringer i `src/components/stopwatch/MeasurementsTable.tsx`

### 1. Dæmp række-hover

Rækkens hover ændres fra `hover:bg-[#c471ed]/10` til en meget svag `hover:bg-muted/30` (eller fjernes helt) så den ikke konkurrerer med element-hover.

### 2. Tydelig hover på tids-knapperne (Start / Slut / Varighed)

På de tre `<button>` for Start, Slut og Varighed:
- Tilføj `hover:bg-[#c471ed]/25 hover:text-foreground hover:ring-1 hover:ring-[#c471ed]/40`
- Behold blyant-ikonet der toner ind (allerede der), men gør det mere synligt: `group-hover:opacity-100`
- Tilføj `transition-colors` for blød overgang

### 3. Tydelig hover på kategori-Select

`SelectTrigger` får:
- `hover:bg-[#c471ed]/25 hover:text-foreground hover:border-[#c471ed]/40`
- I dag står der `hover:border-input` — udskiftes med ovenstående.

### 4. Tydelig hover på skjul-knap (EyeOff)

Knappen i sidste kolonne får:
- `hover:bg-[#c471ed]/25 hover:text-foreground` (i stedet for `hover:bg-accent`)

## Ikke ændret

- Layout, kolonnebredder, font, tabular-nums
- Edit-logik, parsing, masking
- Ryd historik-knap og tooltip i header
- `data-state=selected` (aktiv redigering) stil

## Resultat

Når musen er over en specifik celle eller knap, lyser præcis det element op med tydelig lilla baggrund og ring/border — rækken som helhed forbliver rolig.