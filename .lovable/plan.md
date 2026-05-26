## Mål

1. Når brugeren trykker **Afslut**, åbnes et inline-panel under stopuret med start/slut/varighed + kategori — uden at skubbe sidens flow.
2. Under stopuret vises en **scrollbar tabel** med dagens registreringer, redigerbar inline.
3. Stopuret + knapperne forbliver altid synlige i toppen.
4. "Slet" skjuler visuelt — data bevares og kan ses på en separat arkiv-side.

---

## 1. Datamodel (localStorage — Cloud udsat)

Udvid `Measurement` i `src/hooks/use-measurements.ts`:

```ts
type Category =
  | "straksafgoerelse"
  | "eu_ansoegning"
  | "biometri"
  | "biometri_inkl_ansoegning"
  | "tilbagerejsetilladelse"
  | "forkert_myndighed"
  | "andet";

type Measurement = {
  id: string;
  startedAt: string;  // ISO — NY
  endedAt: string;    // ISO
  ms: number;
  category: Category; // NY
  hidden: boolean;    // NY — "slettet" visuelt, men bevaret
};
```

Migrering: gamle records uden `startedAt`/`category`/`hidden` får defaults ved indlæsning (`category: "andet"`, `hidden: false`, `startedAt = endedAt - ms`).

Nye API'er på hooket:
- `add(draft)` — accepterer hele draft-objektet (start, slut, varighed, kategori)
- `update(id, patch)` — til inline-redigering
- `hide(id)` / `hideAll()` — sætter `hidden: true`
- `unhide(id)` — til arkiv-siden
- selectors: `visibleToday`, `hiddenAll`

---

## 2. Layout — fast stopur, scrollbar tabel

`src/routes/index.tsx` omstruktureres så hele skærmen er en kolonne i `h-screen`:

```text
┌─────────────────────────────┐
│ TopNav                      │  fast
├─────────────────────────────┤
│ Stopwatch (tid + knapper)   │  fast, shrink-0
│ + inline FinishPanel (når   │  absolut-positioneret overlay
│   åben — flyder over uden   │  så sidens flow ikke skubbes
│   at flytte tabellen)       │
├─────────────────────────────┤
│ MeasurementsTable           │  flex-1, overflow-y-auto
│  (egen scrollbar)           │
└─────────────────────────────┘
```

Konkret: `<main>` får `flex flex-col min-h-0`, stopwatch-sektionen er `shrink-0` og `relative`, tabel-sektionen er `flex-1 min-h-0 overflow-y-auto`. FinishPanel renderes som `absolute left-1/2 -translate-x-1/2 top-full mt-3 z-20` inde i stopwatch-sektionen → flyder over tabellen uden at ændre layout.

---

## 3. FinishPanel (inline)

Ny fil: `src/components/stopwatch/FinishPanel.tsx`.

- Åbnes af `Stopwatch` når brugeren trykker Afslut (i stedet for direkte gem). Stopuret nulstilles først ved **Gem** eller **Annuller**.
- Felter:
  - **Starttid** — `<input type="time" step="1">` med dato implicit i dag
  - **Sluttid** — samme
  - **Varighed** — tre `number`-inputs (tt:mm:ss) eller ét mm:ss.cc-felt; ved ændring genberegnes sluttid (start fastholdes)
  - Når start eller slut ændres, genberegnes varighed
  - **Kategori** — `<Select>` (shadcn) med de 7 værdier; default = sidst brugte kategori (gemmes i localStorage), ellers `straksafgoerelse`
- Knapper: **Gem** (primær) og **Annuller** (sekundær). Esc = Annuller.
- Validering: slut > start, varighed > 0. Zod-skema.
- Ved Gem: `add(draft)`, vis bekræftelse via eksisterende `sonner` toast: `"Registrering gemt"`, luk panel, nulstil stopur.
- A11y: panel er `role="dialog" aria-modal="false" aria-labelledby` med focus-trap-light (autofocus første felt, Esc lukker), alle inputs har `<label>`, fejl annonceres med `aria-live="assertive"`.

---

## 4. MeasurementsTable (erstatter MeasurementsList)

Ny fil: `src/components/stopwatch/MeasurementsTable.tsx` (gammel `MeasurementsList.tsx` slettes).

- Bruger shadcn `<Table>`.
- Kolonner: **Start** | **Slut** | **Varighed** | **Kategori** | (handling: skjul)
- Filter: kun `hidden === false` og kun dagens (lokal dato match).
- Inline-redigering: klik på en celle → bliver til input/select; Enter / blur gemmer via `update(id, patch)`; Esc fortryder. Samme validering som FinishPanel.
- Hver række har en skjul-knap (ikon `EyeOff`) som sætter `hidden: true` med toast `"Skjult — kan ses i arkivet"` + Fortryd-action.
- "Ryd historik"-knappen kalder `hideAll()` (samme AlertDialog som før, tekst opdateres: "Skjul alle dagens registreringer? De gemmes i arkivet.").
- Tom tilstand: diskret tekst "Ingen registreringer endnu i dag".

---

## 5. Arkiv-side

Ny rute: `src/routes/arkiv.tsx` (`createFileRoute("/arkiv")`) med eget `head()` (title "Arkiv · pr:cisely", description, og-tags).

- Viser alle `hidden === true` i en simpel tabel grupperet pr. dato.
- Hver række har "Vis igen"-knap (`unhide`).
- Link tilføjes i `TopNav`.

---

## 6. Filer

**Nye**
- `src/components/stopwatch/FinishPanel.tsx`
- `src/components/stopwatch/MeasurementsTable.tsx`
- `src/lib/categories.ts` — konstant array af `{ value, label }`
- `src/routes/arkiv.tsx`

**Ændret**
- `src/hooks/use-measurements.ts` — udvidet model + nye actions + migrering
- `src/components/stopwatch/Stopwatch.tsx` — Afslut åbner FinishPanel (props ændres fra `onSaveMeasurement` til `onRequestFinish(startedAt, endedAt, ms)`); container bliver `relative`
- `src/routes/index.tsx` — nyt scroll-layout, monterer FinishPanel + MeasurementsTable, håndterer dialog-state
- `src/components/stopwatch/TopNav.tsx` — link til /arkiv
- evt. ny shadcn import: `select` (tilføjes hvis ikke i brug)

**Slettet**
- `src/components/stopwatch/MeasurementsList.tsx`

---

## 7. UX-detaljer / a11y (WCAG AA + workspace-guidelines)

- Alle inputs har synlige labels (ikke kun placeholder).
- Min. touch target 44×44px på Skjul/Gem/Annuller.
- Kategorier vises med tekst-label (ikke kun farve).
- Tabel-scroll har synligt fokus på rækker; tastaturnavigation (Tab/Shift+Tab) virker.
- Toast bruger eksisterende `sonner` (allerede AA-OK).

---

## Ikke i scope

- Lovable Cloud / cross-device sync (udsat).
- Eksport / rapporter.
- Multi-dag visning i hovedtabel (kun arkiv viser ældre).
