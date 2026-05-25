## Mål

Giv stopur-knapperne distinkte, semantiske farver — afstemt med brandidentiteten (signaturgradientens korall→lilla→cyan-akse), ikke rå standardfarver.

---

## Farve-mapping

| Knap     | Rolle        | Farve (brand-justeret)        | Token            |
|----------|--------------|-------------------------------|------------------|
| Start    | Bekræftende  | Brand-grøn `#3ec98a`          | `--success`      |
| Afslut   | Afsluttende  | Brand-korall `#ff5a7a`        | `--destructive`  |
| Pause    | Pause        | Brand-gul `#ffd23a`           | `--warning` (ny) |
| Nulstil  | Neutral/info | Brand-cyan `#12c2e9` (fra gradient) | `--info` (ny) |
| Fortsæt  | Genoptag     | Brand-lilla `#c471ed` (fra gradient) | `--primary`  |

### Hvorfor disse hex?

Signaturgradienten er korall `#f64f59` → lilla `#c471ed` → cyan `#12c2e9`. De fire knapper trækkes ind i samme farvefamilie:

- **Grøn `#3ec98a`** — lysere, lidt cyan-trukket grøn der harmonerer med gradientens cyan-ende (i stedet for den mere skovgrønne `#2a9d4a`). Bevarer "bekræft"-betydning.
- **Korall `#ff5a7a`** — lidt varmere/pinkere end DESING's `#f64f59` så den læner mod gradientens korall-til-lilla overgang i stedet for at virke som et alarm-rødt skilt.
- **Cyan `#12c2e9`** — direkte fra gradienten.
- **Lilla `#c471ed`** — direkte fra gradienten (Fortsæt = primær).
- **Gul `#ffd23a`** — varm accent som komplement; ikke i gradienten, men nødvendig for "pause"-distinktion. Holdes blød (ikke neon).

DESING.md's `--destructive` (varsel/fejl) bevares som `#f64f59` til ikke-knap-kontekster (slet-dialog osv.); kun Afslut-knappen får den blødere brand-korall. Implementeringsmæssigt: vi opdaterer `--destructive` til `#ff5a7a` så Afslut og slet-dialog er konsistente — det er den mere brand-tro tolkning.

---

## Ændringer

### `src/styles.css`
- Opdatér i `:root`:
  - `--success: #3ec98a` (var `#2a9d4a`)
  - `--destructive: #ff5a7a` (var `#f64f59`)
- Tilføj:
  - `--warning: #ffd23a`
  - `--warning-foreground: #1a1a1a`
  - `--info: #12c2e9`
  - `--info-foreground: #1a1a1a` (mørk tekst — hvid på cyan fejler WCAG)
- Map i `@theme inline`: `--color-warning`, `--color-warning-foreground`, `--color-info`, `--color-info-foreground`.

### `src/components/stopwatch/Stopwatch.tsx`
- Refaktorér til én `baseBtn` med fælles klasser (min-h-12, rounded-lg, semibold, focus-ring, shadow-sm, transition-colors) + fem farve-varianter:
  - `startBtn`: `bg-success text-success-foreground hover:bg-success/90`
  - `finishBtn`: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
  - `pauseBtn`: `bg-warning text-warning-foreground hover:bg-warning/90`
  - `resetBtn`: `bg-info text-info-foreground hover:bg-info/90`
  - `resumeBtn`: `bg-primary text-primary-foreground hover:bg-primary/90`
- Erstat de eksisterende `primaryBtn`/`secondaryBtn`-brug i de tre status-grene.

---

## Tilgængelighed (WCAG AA)

Kontrast med kort-baggrund og tekstfarve:
- Grøn `#3ec98a` + hvid ≈ 2.4:1 ✗ → brug `--success-foreground: #1a1a1a` ≈ 7.5:1 ✓
- Korall `#ff5a7a` + hvid ≈ 3.3:1 — large text (16px semibold = ≥ 14px bold) OK ved 3:1-grænse ✓
- Gul `#ffd23a` + `#1a1a1a` ≈ 13:1 ✓
- Cyan `#12c2e9` + `#1a1a1a` ≈ 9.6:1 ✓
- Lilla `#c471ed` + hvid ≈ 3.2:1 — large text OK ✓

Farve er ikke eneste signal: hver knap har stadig sit eget ikon og dansk tekstlabel.

---

## Out of scope

- Layout, rækkefølge, ikoner, tekstlabels.
- `MeasurementsList`, `TopNav`, `TimeDisplay`.

---

## Filer der ændres

- `src/styles.css`
- `src/components/stopwatch/Stopwatch.tsx`
