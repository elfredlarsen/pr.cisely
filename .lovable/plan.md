## Mål

Byg en stopur-skærm til webappen "pr:cisely" på forsiden (`/`), med tre tilstande og pr:cisely's visuelle identitet (Poppins).

## Layout

- Fuld højde, centreret indhold på lys baggrund (`#fafafa`).
- Midt på siden:
  - Stort digitalt display i monospaced skrift (JetBrains Mono).
  - `MM:SS` i meget stor størrelse (ca. 8–10rem), `:ss` (hundredele) mindre (ca. 3rem) og baseline-justeret ind på samme linje umiddelbart efter.
  - Under uret: knaprække der ændrer sig efter tilstand.

## Tilstande

1. **Idle** — display `00:00:00`. Knap: `▶ Start` (primær).
2. **Running** — tæller op hver 10 ms. Knapper: `⟲ Nulstil` (sekundær/outline) og `❚❚ Pause` (primær).
3. **Paused** — display frosset. Knapper: `■ Afslut` (sekundær/outline) og `▶▶ Fortsæt` (primær).

Overgange:

- Start: Idle → Running, start-tid = `now`.
- Pause: Running → Paused, gem akkumuleret tid.
- Fortsæt: Paused → Running.
- Nulstil (fra Running): → Idle, tid = 0.
- Afslut (fra Paused): → Idle, tid = 0.

## Teknisk

- Ny route-fil `src/routes/index.tsx` (erstatter placeholder) med stopur-komponenten.
- Komponenter:
  - `src/components/stopwatch/Stopwatch.tsx` — state machine via `useReducer` (`idle | running | paused`), `requestAnimationFrame`-loop for display, tid beregnet som `elapsed + (now - startedAt)`.
  - `src/components/stopwatch/TimeDisplay.tsx` — formaterer ms til `MM:SS` + `ss` (to-cifret hundredele), bruger `tabular-nums` og monospaced font.
  - `src/components/stopwatch/TopNav.tsx` — top-tabs.
- Designtokens i `src/styles.css`:
  - Tilføj Google Fonts-import for Poppins + JetBrains Mono.
  - Brand-farver fra logo-systemet: gradient `#f64f59 → #c471ed → #12c2e9`, primær accent `#c471ed`.
  - Semantiske tokens: `--brand-primary`, `--brand-gradient`, `--font-mono`, `--font-sans`.
- Tilgængelighed: knapper er rigtige `<button>`, fokus-ring synlig, `aria-live="polite"` på tidsvisningen, mål ≥44×44px, kontrast AA, lang="da" på `<html>`, semantisk `<main>` og `<nav>`. Title/meta opdateres til "pr:cisely · Stopur".

## Ud af scope

- Ingen backend, ingen lagring af målinger (Oversigt-tab er kun visuel).
- Ingen mørk tilstand i denne omgang.
- Ingen logo-SVG implementeret nu — kun ord-mærket `pr:cisely` i top-nav.