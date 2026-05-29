# Plan: Forbedringer til Oversigt

Tre ændringer, alle i Oversigt-siden (`/arkiv`). Ingen ændringer i forretningslogik.

## 1. Inline-redigering som i stopurets historik

Erstat "Rediger"-blyantknappen + `MeasurementDialog` for eksisterende rækker med samme inline-redigeringsmønster som `MeasurementsTable.tsx`:

- Klik på **Start**, **Slut** eller **Varighed** åbner cellen som input (native `type="time"` for Start/Slut, maskeret `text` for Varighed).
- Samme commit-logik: Enter/blur gemmer, Escape annullerer. Varighed opdaterer Slut, Start/Slut opdaterer Varighed.
- Hover viser blyant-ikon i cellen (samme stil som historikken).
- Rækken får lilla highlight (`bg-[#c471ed]/15`) når den redigeres.
- Tilføj en **Kategori**-kolonne med samme `Select`-dropdown som historikken, så man kan flytte en registrering til en anden kategori inline.
- **Slet**-knappen (skraldespand + bekræftelsesdialog) bevares som eneste handlingsknap.
- `MeasurementDialog` bruges fortsat til **Tilføj registrering** (uændret).

Refaktor: Træk den fælles tids-/varighedslogik (parse, mask, fmt) ud i en lille hjælpermodul `src/components/oversigt/inline-edit.ts` (eller genbrug `format.ts`), så samme adfærd bruges begge steder uden at duplikere kode.

## 2. Fold alle kategorier ud/ind

Tilføj en knap øverst i kategorilisten (i `src/routes/arkiv.tsx`), placeret i højre side ud for `DaySummary` eller på egen linje lige under:

- Tekst skifter mellem **"Fold alle ud"** og **"Fold alle ind"** afhængigt af nuværende tilstand (hvis alle er åbne → "Fold alle ind", ellers → "Fold alle ud").
- Knappen styrer `open`-tilstanden for hver `CategoryGroup` via løftet state i `arkiv.tsx`: `openCategories: Set<Category>`. `CategoryGroup` skifter til controlled `open`/`onOpenChange`.
- Skjules når der ingen kategorier er.

## 3. Tydeliggør "t" og "t:m"

Erstat den korte `ToggleGroup` i `DaySummary.tsx` med tydelige labels:

- `t` → **"Decimaltimer"** (eksempel ved hover/tooltip eller hjælpetekst: `1,50 t`)
- `t:m` → **"Timer og minutter"** (eksempel: `1 t 30 min`)

Konkret: Vis fulde labels i `ToggleGroupItem`-teksten frem for kun "t"/"t:m". Hvis pladsen er trang på små viewports, brug korte labels med `title`/`aria-label` der altid indeholder den fulde forklaring, plus en lille hjælpe-linje ("Vis som decimaltimer eller timer + minutter") til venstre for toggle.

Foretrukket løsning: fulde labels i knapperne ("Decimaltimer" / "Timer + minutter"), evt. med ikon. Det matcher DESIGN.md (klarhed, dansk, læselighed) bedst.

## Filer der ændres

- `src/components/oversigt/CategoryGroup.tsx` — controlled open; inline-redigering af Start/Slut/Varighed/Kategori; fjern Rediger-knap, behold Slet.
- `src/components/oversigt/DaySummary.tsx` — tydelige labels på toggle.
- `src/components/oversigt/format.ts` — evt. ekstra helpers (parseTime, parseDuration, maskDuration) genbrugt fra historikken.
- `src/routes/arkiv.tsx` — løft `openCategories` state op; tilføj "Fold alle ud/ind"-knap; fjern brug af `MeasurementDialog` til redigering (kun til tilføjelse); send `onInlineUpdate` ned i `CategoryGroup`.

Ingen nye pakker. Ingen ændringer i `use-measurements.ts` eller routes.
