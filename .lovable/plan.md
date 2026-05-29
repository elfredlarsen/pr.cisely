## Mål
Opdater kategorilisten og tilføj valgfri kommentar til "Andet".

## Ny kategoriliste (rækkefølge)
1. Straksafgørelse — `straksafgoerelse`
2. Arbejdstager — `arbejdstager`
3. Tilstrækkelige midler — `tilstraekkelige_midler`
4. Studerende — `studerende`
5. Tidsubegrænset ophold — `tidsubegraenset_ophold`
6. EU-familiemedlem — `eu_familiemedlem`
7. Tredjelandsfamiliemedlem — `tredjelandsfamiliemedlem`
8. Selvstændig erhvervsdrivende — `selvstaendig_erhvervsdrivende`
9. EU-vejledning — `eu_vejledning`
10. 1G Sekundær bevægelighed — `et_g_sekundaer_bevaegelighed`
11. TUB Sekundær bevægelighed — `tub_sekundaer_bevaegelighed`
12. Biometri — `biometri`
13. Andet — `andet` (med valgfri kommentar)

## Ændringer

### `src/lib/categories.ts`
- Erstat `Category` union og `CATEGORIES` med ovenstående 13 værdier i den givne rækkefølge.
- `getLastCategory()` falder tilbage til `straksafgoerelse` hvis gemt værdi ikke længere findes.

### `src/hooks/use-measurements.ts`
- Tilføj `comment?: string` til `Measurement` og `MeasurementDraft`.
- `migrate()`: slet registreringer hvis `category` ikke findes i ny liste (returnerer kun gyldige). Læs `comment` hvis string.
- `add()` videregiver `comment`.
- Opdater `buildSeed()` så den kun bruger gyldige kategorier (`straksafgoerelse`, `biometri`, evt. `eu_vejledning`).

### `src/components/stopwatch/FinishPanel.tsx`
- Tilføj `comment` state.
- Når `category === "andet"` vises et valgfrit `<textarea>` "Kommentar (valgfri)" under kategori-feltet.
- Send `comment` (trimmet, eller udeladt hvis tom) med i `onSave`.

### `src/components/oversigt/CategoryGroup.tsx`
- Når en række tilhører `andet`: vis kommentaren som lille muted tekst-linje under hovedrækken (ekstra `<TableRow>` med colspan, kun hvis kategori = andet — vist altid, også uden kommentar med placeholder "Tilføj kommentar").
- Inline-redigerbar: klik på kommentar-linjen → `<input>` der gemmer via `onUpdate(id, { comment: value.trim() || undefined })` ved blur/Enter, Esc annullerer.
- Hvis kategori ændres væk fra `andet` via category-skift dialogen, ryd kommentar (`comment: undefined`).

### `src/components/oversigt/MeasurementDialog.tsx`
- Hvis denne dialog stadig bruges til redigering: tilføj kommentar-felt synligt kun ved `andet`. (Hvis ikke længere brugt efter inline-edit, springes over — bekræftes ved gennemsyn.)

## Teknik
- "Slet eksisterende registreringer i fjernede kategorier" sker automatisk via `migrate()` næste gang data læses fra localStorage. Ingen separat migrations-knap.
- Kommentar gemmes i samme localStorage-nøgle som en del af `Measurement`-objektet.
- Ingen ændringer i `format.ts`, `DaySummary.tsx`, eller stopurets `MeasurementsTable.tsx`.
