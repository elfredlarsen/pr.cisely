# Plan: Oversigt-side med tidsregistreringer pr. kategori

Erstatter den nuværende `/arkiv`-side med en ny **Oversigt**-side på samme rute. Følger DESIGN.md (Poppins, lilla #c471ed accent, dansk tekst, 44×44 touch, bekræftelsesdialog ved slet).

## Rute & navigation

- Omdøb `src/routes/arkiv.tsx` → bevar URL `/arkiv` (for at undgå at flytte ruter), men ændr titel/H1/meta til "Oversigt".
- Opdater `TopNav.tsx`: ikon-label fra "Arkiv" → "Oversigt" (ikon: `CalendarDays` i stedet for `Archive`).
- Skjulte registreringer (eksisterende "arkiv"-funktion) — vises ikke længere på denne side. De findes stadig i state via `useMeasurements().hiddenAll`, men UI fjernes her. (Hvis bruger senere vil have et separat arkiv kan det tilføjes.)

## Sideopbygning

```text
┌─ TopNav ──────────────────────────────────────┐
│                                                │
│       ◀   Tirsdag d. 26. maj 2026   ▶         │  ← Datovælger
│                                                │
│     +  Samlet tid:  4,75 t   [t / t:m]        │  ← Opsummering
│                                                │
│  ▸ Straksafgørelse              2,50 t  (3)   │  ← Collapsible
│  ▸ Biometri                     1,25 t  (2)   │
│  ▸ EU-ansøgning modtaget        1,00 t  (2)   │
└────────────────────────────────────────────────┘
```

### Datovælger (komponent: `DateNavigator`)

- Tre elementer i en flex-row, centreret: `◀`-knap (icon button, `ChevronLeft`), dato-knap, `▶`-knap (`ChevronRight`).
- Dato-knap: shadcn `Button variant="ghost"` med tekst som `"Tirsdag d. 26. maj 2026"` (formateret via `Intl.DateTimeFormat("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })` + "d." indsat).
- Klik åbner shadcn `Popover` med `Calendar` (react-day-picker). `mode="single"`, `locale={da}` fra `date-fns/locale`.
- **Markering af dage med data**: brug `modifiers={{ hasData: datesWithMeasurements }}` + `modifiersClassNames={{ hasData: "font-semibold text-primary underline underline-offset-4" }}` så dage med registreringer fremhæves; dage uden bruger default.
- Pilene flytter dagen ±1; deaktiveres ikke (man må gerne navigere til tomme dage).

### Dagsopsummering (komponent: `DaySummary`)

- Højrejusteret blok øverst i indholdsområdet.
- "Samlet tid: **4,75 t**" eller "**4 t 45 min**" afhængig af toggle.
- Toggle: shadcn `ToggleGroup` (size sm) med to muligheder: `t` (decimal) og `t:m` (timer+minutter). Default `t`. Valg gemmes i `localStorage` (`precisely.summaryFormat`).
- Decimal: `(ms / 3600000).toFixed(2).replace(".", ",")` + " t".
- Timer+minutter: `${h} t ${m} min` (udelad "0 t" hvis < 1 time).

### Kategorisektioner (komponent: `CategoryGroup`)

- Iterér over `CATEGORIES` i fast rækkefølge; vis kun dem med ≥1 registrering for valgt dag.
- Hver sektion: shadcn `Collapsible`, default `open=false`.
- Header (klikbar trigger, min-h-11):
  - Venstre: `ChevronRight` (roterer 90° når åben) + kategori-label.
  - Højre: samlet tid for kategorien (samme format som global summary) + antal i parentes.
- Content: tabel med kolonner **Start**, **Slut**, **Varighed**, **Handlinger** (rediger/slet ikoner). Bruger eksisterende `Table`-primitive med `table-fixed` (som i `MeasurementsTable`).
  - **Rediger**: åbner samme dialog som "Tilføj registrering", forudfyldt.
  - **Slet**: shadcn `AlertDialog` med "Annuller" (outline) og "Slet" (destructive, korall #f64f59). Ved bekræftelse fjernes registreringen permanent (ny `remove(id)`-funktion i `use-measurements`).

### Tilføj/rediger-dialog (komponent: `MeasurementDialog`)

- shadcn `Dialog`. Genbruger felt-logik fra `FinishPanel` (Start, Slut, Varighed med auto-beregning + Kategori-select). Refaktoreres til en delt komponent eller kopieres pragmatisk.
- Ved "Tilføj" forudfyldes start/slut til "nu" på den valgte dag (eller tomt), kategori = `getLastCategory()`.
- Ved "Rediger" forudfyldes felter fra eksisterende registrering.
- Knapper: "Annuller" (outline) + "Gem" (primær). Bruger formvalidering med Zod som i FinishPanel.

### Empty state

- Hvis ingen registreringer for valgt dag: centreret `<p className="text-sm text-muted-foreground">Ingen registreringer denne dag</p>` mellem opsummering og "Tilføj"-knap.
- Opsummering viser stadig "Samlet tid: 0,00 t".

## Testdata

- I `use-measurements.ts` tilføj seed-logik: hvis `localStorage[STORAGE_KEY]` er `null` (første load nogensinde), indsæt 7 hardkodede registreringer på i dag fordelt på 3 kategorier:
  - Straksafgørelse: 3 stk (fx 0:45:00, 1:00:00, 0:45:00)
  - Biometri: 2 stk (fx 0:30:00, 0:45:00)
  - EU-ansøgning modtaget: 2 stk (fx 0:30:00, 0:30:00)
- Bruger eksisterende `add()`/migrate-flow; alle med `hidden: false`.

## use-measurements.ts ændringer

- Ny `remove(id)` der filtrerer registrering ud permanent.
- Ny `addAt(draft)` (eller udvid `add`) som accepterer fuld ISO-dato (ikke bare "i dag") — `add` understøtter allerede dette via `startedAt`/`endedAt`-strenge.
- Ny memo `byDate(dateISO)` eller helper i Oversigt-route der filtrerer på valgt dag (lokal dag-sammenligning, som eksisterende `isSameLocalDay`).
- Ny memo `datesWithMeasurements` — set af `yyyy-mm-dd`-strenge for `Calendar`-modifier.

## Filer

- **Ny**: `src/components/oversigt/DateNavigator.tsx`, `DaySummary.tsx`, `CategoryGroup.tsx`, `MeasurementDialog.tsx`.
- **Skrives om**: `src/routes/arkiv.tsx` (samme rute, nyt indhold + ny titel).
- **Opdateres**: `src/components/stopwatch/TopNav.tsx` (label/ikon), `src/hooks/use-measurements.ts` (remove + seed), evt. `src/lib/categories.ts` (helper til total-pr-kategori).
- Tilføj `date-fns` hvis ikke allerede installeret (tjekkes; ellers `bun add date-fns`).

## Bekræftelse på rute-navn

URL'en `/arkiv` beholdes for at undgå routing-arbejde, men siden hedder "Oversigt" i UI. Sig til hvis du i stedet vil have URL'en omdøbt til `/oversigt` (kræver ny route-fil + sletning af `arkiv.tsx`).