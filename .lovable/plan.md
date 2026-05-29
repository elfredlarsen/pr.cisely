## Mål

Først: gør alle tidsfelter (Start, Slut, Varighed) **visuelt identiske** på tværs af Oversigt-tabellen, Historik-tabellen, MeasurementDialog og FinishPanel. Derefter sikres at hele `HH:MM:SS` + native ur-ikon/spinner kan ses uden afklipning.

## Nuværende inkonsistens

| Sted | Højde | Bredde | Tekststr. |
|---|---|---|---|
| Oversigt-tabel (input) | h-8 | w-28 | text-xs |
| Oversigt-tabel (knap) | h-8 | w-28 | text-xs |
| Historik-tabel (start/slut input) | h-8 | w-28 | text-sm |
| Historik-tabel (varighed input) | h-8 | **w-24** | text-sm |
| MeasurementDialog (alle) | h-10 | grid-cell | text-sm |
| FinishPanel (alle) | h-10 | grid-cell | text-sm |

Dialoger og tabeller har bevidst forskellig størrelse (dialog = primær, tabel = kompakt), men **inden for hver kontekst** skal felterne være ens, og bredden skal være den samme for start/slut/varighed.

## Fælles standard

**Tabel-kontekst (Oversigt + Historik):**
- Højde: `h-8`
- Bredde: `w-36` (144px — rummer HH:MM:SS + native spinner)
- Tekststr.: `text-xs` (Historik justeres ned fra `text-sm` for at matche Oversigt)
- Padding: `px-2`
- Border-radius og border-input: uændret

**Dialog/panel-kontekst (MeasurementDialog + FinishPanel):**
- Højde: `h-10`
- Bredde: fyld grid-cellen (grid-cols-3, gap-3)
- Container-bredde øges så cellerne kan rumme værdien:
  - `MeasurementDialog`: `sm:max-w-md` → `sm:max-w-lg`
  - `FinishPanel`: `w-[min(28rem,...)]` → `w-[min(32rem,...)]`
- Tekststr.: `text-sm` (uændret)

## Filer og ændringer

### 1. `src/components/oversigt/CategoryGroup.tsx`
- `renderTimeCell` input + knap: `w-28` → `w-36`
- `renderDurationCell` input + knap: `w-28` → `w-36`
- `<TableHead>` Start/Slut/Varighed: `w-28` → `w-36`

### 2. `src/components/stopwatch/MeasurementsTable.tsx`
- `renderTimeCell` input + knap: `text-sm w-28` → `text-xs w-36`
- `renderDurationCell` input + knap: `text-sm w-24` → `text-xs w-36`
- `<TableHead>` Start/Slut/Varighed: `w-28`/(varighed) → alle `w-36`

### 3. `src/components/oversigt/MeasurementDialog.tsx`
- `DialogContent` className: `sm:max-w-md` → `sm:max-w-lg`
- Felternes klasser allerede ensartet (`h-10 ... text-sm`); ingen ændring.

### 4. `src/components/stopwatch/FinishPanel.tsx`
- Wrapper-div: `w-[min(28rem,calc(100vw-2rem))]` → `w-[min(32rem,calc(100vw-2rem))]`
- Felternes klasser allerede ensartet; ingen ændring.

## Hvad ændres ikke

- Logik, validering, sortering, kategorier, kommentarer.
- Historik beholder sin `opacity-75` og blødere border — den er stadig sekundær, men nu med samme strukturelle layout som Oversigt.
- Kategori-kolonnen er fortsat `w-auto`.
- Designtokens (farver, runde hjørner, fokus-ring) er uændrede.

## Verifikation

Efter implementering, tjek i preview at:
1. Start/Slut/Varighed har præcis samme bredde i Oversigt og Historik.
2. Tekststørrelsen er ens i de to tabeller.
3. Hele `HH:MM:SS` + spinner er synligt ved klik på alle fire steder.
4. Dialogerne åbner uden at felterne klippes.