## Problem

Tabellerne bruger `table-fixed` med `w-auto min-w-[7rem]` på Start/Slut/Varighed *og* `w-auto` på Kategori. Med `table-fixed` deler alle `w-auto`-kolonner den resterende plads ligeligt → tidskolonnerne får ~25% af bredden hver (alt for meget luft mellem `HH:MM:SS`), og Kategori klemmes sammen så labels som "TUB Sekundær…" eller "EU-vejledning" trunkeres.

## Løsning

Giv tidskolonnerne en **fast, kompakt bredde** så Kategori (`w-auto`) automatisk får alt det overskydende.

- Tidskolonner (`<TableHead>` + `<TableCell>` indhold): `w-[7rem]` (112px) — nok til `HH:MM:SS` + blyant-ikon, ingen luft i overskud.
- Inputs/knapper i tidsceller: `w-full` i stedet for `w-auto min-w-[7rem]` (de fylder cellen som nu er stram).
- Kategori-kolonne: `w-auto` (uændret) — får al resterende plads.
- Handlinger-kolonne: uændret (`w-16` i Oversigt, `w-36` i Stopur-tabel med "Ryd historik"-knap).

## Filer

### `src/components/oversigt/CategoryGroup.tsx`
- 3× `<TableHead>` (Start/Slut/Varighed): `w-auto min-w-[7rem]` → `w-[7rem]`.
- 4× input/knap i `renderTimeCell` og `renderDurationCell`: `w-auto min-w-[7rem]` → `w-full`.

### `src/components/stopwatch/MeasurementsTable.tsx`
- 3× `<TableHead>` (Start/Slut/Varighed): `w-auto min-w-[7rem]` → `w-[7rem]`.
- 4× input/knap: `w-auto min-w-[7rem]` → `w-full`.

## Uændret

Dialoger (`MeasurementDialog`, `FinishPanel`) — de er ikke tabeller, og auto-bredden virker fint der. Logik, validering, kategorier, designtokens, højder.

## Verifikation

I preview tjekkes at:
1. Tidskolonnerne er kompakte uden tom plads til højre for tallene.
2. Kategori-kolonnen viser hele labels uden trunkering ved standard kategorinavne.
3. Begge tabeller (Stopur-historik og Oversigt-grupper) ser ens og balancerede ud.
