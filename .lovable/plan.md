## Mål
Erstat nuværende `TopNav` med designet fra `navbar.html` — luftig 64 px bar, glasbaggrund, gradient-kolon-logo i ren tekst, hover-pill på links, gradient-underline på aktiv, Log ud-knap med ikon + outline.

## Det jeg porterer 1:1 (visuelt)

### `src/components/stopwatch/TopNav.tsx`
- **Højde/baggrund:** `h-16`, `px-8`, `bg-background/92 backdrop-blur-md`, `border-b border-border/60`, sticky.
- **Logo:** Drop SVG-filen. Render i stedet ren tekst (Poppins, 26 px, weight 500, letter-spacing −0.9 px):
  ```
  <span>pr</span><span class="bg-gradient-to-br from-[#f64f59] via-[#c471ed] to-[#12c2e9] bg-clip-text text-transparent">:</span><span>cisely</span>
  ```
  Det giver "plads til at ånde" igen og matcher prototypen præcist. SVG-logoet beholdes i `src/assets/` men bruges ikke i nav (kan stadig bruges som hero/auth-skærm).
- **Nav-links:** `px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground`, hover → `text-foreground bg-foreground/5`. Gradient-underline via `::after` (bottom-2, scaleX 0.4→0.7 på hover, full + opacity 1 på aktiv). Implementeres med en lille CSS-klasse i `styles.css` eller inline med Tailwind arbitrary values + en `data-active` attribut.
- **Log ud:** Outline-knap (`border border-border/60 rounded-lg px-4 py-1.5 text-sm`) med Lucide `LogOut`-ikon (15 px, opacity 60 → 100 på hover). På mobil (`<640px`) skjules tekst, kun ikon vises.
- **Layout:** `flex justify-between` (logo venstre, center-gruppe, actions højre) — ikke det nuværende 3-kolonne grid.
- **Poppins:** Tilføj Google Fonts-link i `src/routes/__root.tsx` `head()` (weight 400/500/600). Brug `font-family: 'Poppins', system-ui` enten via en utility-klasse på navbaren eller som global body-font.

### `src/styles.css`
- Tilføj gradient-tokens hvis vi vil genbruge:
  ```css
  --gradient-brand: linear-gradient(135deg, #f64f59, #c471ed, #12c2e9);
  ```
- Tilføj små regler for `.nav-link::after` (gradient-underline animation) — Tailwind kan ikke gøre dette rent på pseudo-elementer uden en klasse.

## Det jeg IKKE inkluderer (kræver beslutninger)

Prototypen har to features som er mere end visuelt design:

1. **Live timer-pille i navbaren** (`#navTimer`) — viser kørende stopur på alle sider.
   Kræver at stopur-state løftes ud af `Stopwatch.tsx` til en global store (Context / Zustand) så `TopNav` kan læse den. Det er en arkitektur-ændring, ikke et nav-design.

2. **Log ud-bekræftelses-modal** med advarsel hvis timer kører.
   Der er ingen rigtig auth endnu — `Log ud` er en placeholder uden handler. Modal giver først mening når auth er på plads.

**Forslag:** Vi laver visuel port nu. Live timer + logout-modal tages som separate opgaver når (a) vi løfter stopur-state, og (b) auth er koblet til. Sig til hvis du vil have en af dem med i denne omgang.

## Verifikation
- `/`, `/arkiv`, `/indstillinger` viser ny nav med korrekt aktiv underline.
- Logo læselig, gradient-kolon synlig.
- Log ud-knap har ikon + outline, kun ikon på smal viewport.
- Tastatur-fokus-ring synlig på links og knapper.
