## Mål
Når kategorilisten har flere end 7 rækker (dvs. kan scrolles), vises en blød fade-gradient i toppen og bunden af listen som visuelt hint om, at der er mere indhold. Gradienten skjules dynamisk, når man er scrollet helt til toppen eller bunden.

## Ændringer

### `src/components/indstillinger/CategoriesSection.tsx`
- Wrap den scrollbare `<ul>` i en `<div className="relative">`-container.
- Tilføj to overlay-elementer (`<div aria-hidden>`) absolut placeret på toppen og bunden af containeren:
  - Top: `pointer-events-none absolute inset-x-0 top-0 h-6 rounded-t-md bg-gradient-to-b from-card to-transparent`
  - Bund: `pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-md bg-gradient-to-t from-card to-transparent`
- Brug `useRef` på `<ul>` + `useState` for `canScrollUp`/`canScrollDown`. Beregn ved mount, ved `scroll`-event på listen, og ved `resize`-event på vinduet.
- Top-overlay rendres kun når `canScrollUp` er sandt; bund-overlay kun når `canScrollDown` er sandt. På den måde forsvinder hintet, når der ikke er mere at scrolle (og vises slet ikke når listen ≤ 7 rækker, da `scrollHeight === clientHeight`).
- Overlays bruger `bg-gradient-to-b/t from-card to-transparent`, så de fader mod sektionens kort-baggrund (`bg-card`) og matcher den eksisterende lyse tema-token uden at indføre nye farver.

## Verifikation
- Med alle 13 kategorier aktive: top-fade skjult ved start, bund-fade synlig. Scroll ned → top-fade dukker op. Helt i bunden → bund-fade forsvinder.
- Hvis listen reduceres til 7 eller færre synlige rækker, vises ingen fade.
- Scrollbar (`scrollbar-purple`) fungerer uændret; overlays er `pointer-events-none` og blokerer ikke interaktion med Switches.
