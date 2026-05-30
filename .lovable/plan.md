## Mål

Gøre `TopNav` slank og minimal: subtil bundkant, ingen fyldt baggrund, kun tekst (ingen ikoner), og en tredelt layout-fordeling med generøs luft.

## Ændringer i `src/components/stopwatch/TopNav.tsx`

### Layout (tredelt)

Skift fra én flex-række til et 3-kolonne grid, så midten altid er centreret uafhængigt af logo-/højre-side bredde:

```
[ Logo ]            [ Stopur · Oversigt · Indstillinger ]            [ Log ud ]
   venstre                              midten                          højre
```

- Container: `grid grid-cols-[1fr_auto_1fr] items-center` i en `max-w-6xl` wrapper.
- Venstre celle: logo, `justify-self-start`.
- Midter-celle: nav-items, `justify-self-center`, indbyrdes afstand `gap-10` (generøs whitespace).
- Højre celle: "Log ud", `justify-self-end`.
- "Hjælp" fjernes fra nav for at holde det rent og minimalt (kan evt. flyttes til indstillinger senere). Bekræft hvis det skal beholdes.

### Visuelt udtryk

- Baggrund: helt transparent (fjern `bg-card/60 backdrop-blur`) — bruger sidens `--background`.
- Kun en subtil `border-b border-border` under.
- Vertikal padding: `py-4` for mere luft (i stedet for `py-2`).
- Horisontal padding: `px-6`.

### Items (kun tekst, ingen ikoner)

- Fjern alle Lucide-ikoner fra nav-items.
- Tekststil: `text-sm font-medium tracking-wide text-muted-foreground`.
- Hover: kun farveskift til `text-foreground` (ingen baggrund/pille).
- Aktiv rute: `text-foreground` + en tynd underline via `after:` pseudo-element (2px, `bg-primary`, kun under teksten), så aktiv tilstand stadig er tydelig uden at bryde det minimale look.
- Focus-visible: behold ring for tilgængelighed (WCAG/DESIGN.md).
- Min. klikflade: behold `min-h-11` så 44px touch-target opretholdes (DESIGN.md).

### Logo

- Behold gradient-tekst "pr:cisely".
- Lidt større: `text-xl`, ingen ekstra margin-right (grid styrer placering).

### "Log ud"

- Samme tekststil som nav-items, men `text-muted-foreground hover:text-destructive` for visuel adskillelse uden ikon.

## UI/UX-forslag (til godkendelse)

1. **Fjerne "Hjælp"** fra top-nav for at holde midten ren og symmetrisk (3 items i midten). Hjælp kan ligge i indstillinger eller en footer.
2. **Aktiv-indikator som underline** frem for udfyldt baggrund — matcher det minimale look bedre end den nuværende `bg-secondary` pille.
3. **Mobil**: Ved smal viewport kollapser grid til en enkelt række med `gap-4` og mindre tekst; alternativt skjules venstre/højre-celler ikke, da der kun er 4–5 items. Foreslår at beholde tredelt også på mobil og blot reducere `gap` og padding. Hamburger-menu er overkill her.
4. **Sticky header** (`sticky top-0 z-40`) så nav altid er tilgængelig under scroll på lange sider — valgfrit.

## Verifikation

- `/`, `/arkiv`, `/indstillinger`: nav viser logo til venstre, 3 items centreret, "Log ud" til højre.
- Ingen ikoner synlige, ingen fyldt baggrund, kun bundkant.
- Aktiv rute har underline-indikator.
- Tab-navigation viser tydelig focus-ring.
- Touch-targets ≥ 44px.

Bekræft venligst:

- Skal "Hjælp" fjernes fra top-nav? Hjælp skal fjernes helt og ikke placeres et andet sted.
- Skal headeren være sticky? Ja