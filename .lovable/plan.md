## Mål

Bring `pr:cisely` i fuld overensstemmelse med `DESING.md`.

---

## A. Knapper: fjern gradient, brug solid lilla

DESING.md: "Gradienten må ikke bruges til almindelige knapper eller baggrunde." I dag bruger `Start`, `Afslut` og `Fortsæt` `var(--brand-gradient)`.

**`src/components/stopwatch/Stopwatch.tsx`:**
- Fjern `style={{ background: "var(--brand-gradient)" }}` fra alle primære knapper.
- `primaryBtn` får `bg-primary` + `hover:bg-primary/90` (solid lilla #c471ed).
- Sekundære knapper er allerede compliant.

---

## B. Slet-bekræftelse: AlertDialog i stedet for window.confirm()

DESING.md: "Alle slet-handlinger bekræftes i en dialogboks med tydelige knapper: 'Annuller' og 'Slet' (rød)."

**`src/components/stopwatch/MeasurementsList.tsx`:**
- Importér `AlertDialog`-komponenterne (`@/components/ui/alert-dialog` findes allerede).
- Erstat `window.confirm(...)` med dialog:
  - Titel: "Slet alle målinger?"
  - Beskrivelse: "Denne handling kan ikke fortrydes."
  - `AlertDialogCancel`: "Annuller"
  - `AlertDialogAction`: "Slet" (rød via `bg-destructive`)

---

## C. Design-tokens matcher DESING.md hex-værdier

**`src/styles.css`:**
- `--background`: `#fafafa`
- `--foreground`: `#1a1a1a`
- `--muted-foreground`: `#666666`
- `--primary`: `#c471ed`
- `--destructive`: `#f64f59`
- `--card` / `--popover`: `#ffffff`
- Tilføj `--success: #2a9d4a` + map i `@theme inline`.
- Behold `--brand-gradient`, Poppins, JetBrains Mono.

---

## D. Logo som signaturmoment

**`src/components/stopwatch/TopNav.tsx`:**
- `pr:cisely`-wordmark får gradient-tekst (`background-clip: text`). Eneste sted gradienten bruges.

---

## Out of scope

State-maskine, målings-logik, layout og typografi er uændret.

---

## Filer der ændres

- `src/styles.css`
- `src/components/stopwatch/Stopwatch.tsx`
- `src/components/stopwatch/MeasurementsList.tsx`
- `src/components/stopwatch/TopNav.tsx`
