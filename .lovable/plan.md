## Mål

Erstat fast `w-36` på tidsfelterne (Start, Slut, Varighed) med auto-bredde + et minimum, så felterne skrumper til indholdet uden at klippe `HH:MM:SS` + ur-ikon/spinner. Gælder både tabeller og dialoger/paneler.

## Strategi

- Input: `w-auto min-w-[7rem]` (112px) + behold `tabular-nums` så bredden er stabil.
- Knap-fallback (vises når feltet er tomt/ugyldigt i tabellerne): samme `w-auto min-w-[7rem]` så layoutet ikke hopper når man skifter mellem knap og input.
- Tabel-kolonneoverskrifter (`<TableHead>`): `w-auto` + samme `min-w-[7rem]` så kolonnen ikke kollapser når alle rækker er tomme, men heller ikke reserverer unødig plads.

7rem (112px) dækker `HH:MM:SS` i `text-xs`/`text-sm` med tabular-nums + native ur-ikon på Chrome/Safari/Firefox med lidt margin.

## Filer

### 1. `src/components/oversigt/CategoryGroup.tsx`
- `renderTimeCell` input + knap: `w-36` → `w-auto min-w-[7rem]`
- `renderDurationCell` input + knap: `w-36` → `w-auto min-w-[7rem]`
- `<TableHead>` Start/Slut/Varighed: `w-36` → `w-auto min-w-[7rem]`

### 2. `src/components/stopwatch/MeasurementsTable.tsx`
- Samme ændringer som ovenfor: `w-36` → `w-auto min-w-[7rem]` på inputs, knapper og `<TableHead>`.

### 3. `src/components/oversigt/MeasurementDialog.tsx`
- Skift `grid grid-cols-3 gap-3` → `flex flex-wrap gap-3` så felterne tager naturlig bredde i stedet for at strække til en tredjedel hver.
- Felter får `w-auto min-w-[7rem]` (i stedet for implicit fuld cellebredde).
- `DialogContent`: `sm:max-w-lg` → `sm:max-w-md` (kan skrumpes igen, da felterne nu er kompakte).

### 4. `src/components/stopwatch/FinishPanel.tsx`
- Samme grid → flex-wrap ændring som dialogen.
- Felter får `w-auto min-w-[7rem]`.
- Wrapper: `w-[min(32rem,calc(100vw-2rem))]` → `w-[min(28rem,calc(100vw-2rem))]`.

## Fallback hvis det ikke duer

Hvis auto-bredden giver layout-spring, klipning på en browser, eller ujævn kolonnebredde mellem rækker i tabellen, går jeg over til forslag 1: fast `w-32` (128px) overalt, samme steder.

## Hvad ændres ikke

Logik, validering, kategorier, kommentarer, designtokens, tekststørrelser, højder (`h-8` i tabel, `h-10` i dialog).

## Verifikation

I preview tjekkes at:
1. Hele `HH:MM:SS` + ur-ikon er synligt i alle fire kontekster.
2. Tabelkolonner har samme bredde på tværs af rækker (ingen spring mellem input og knap-fallback).
3. Dialog og panel ser balancerede ud uden tom plads til højre for felterne.
