# Ny brand-gradient: Ton-i-ton Lilla & Violet

## Hvad ændres
Logoets kolon, browserfanens ikon og de små lilla detaljer skifter fra koral/lilla/cyan til en rolig lilla gradient, der matcher stopurets lilla knap.

- Start: indigo `#6366f1`
- Midte: appens lilla `#9333ea` (samme som Start/Pause)
- Slut: fuchsia `#d946ef`

Steder, der opdateres:
1. Kolonet i "pr:cisely" i menulinjen, på login og på nulstil-adgangskode.
2. Logofilen og browserfanens ikon (de to prikker).
3. Appens ikoner på hjemmeskærmen (PWA) gentegnes med de nye farver.
4. Små accenter, der i dag bruger den gamle lyse lilla: stregen under det aktive menupunkt og rullebjælken. De får `#9333ea` (mørk tilstand: `#a855f7`), så de matcher knapperne.
5. Designguiden opdateres med de nye farver.

Knapfarverne på stopuret (lilla, petrolgrøn, blågrå) forbliver som nu.

## Teknisk
- `src/styles.css`: én fælles token `--gradient-brand: linear-gradient(135deg, #6366f1, #9333ea, #d946ef)`; dubletten `--brand-gradient` fjernes. `--brand-primary` sættes til `var(--primary)`. Nav-understregning og scrollbar bruger `var(--color-brand)` i stedet for hårdkodede hex; scrollbar-hover bruger en mørkere nuance via `color-mix`.
- `src/assets/precisely-logo.svg`, `public/favicon.svg`: nye `<stop>`-farver.
- `public/icons/*.png`: gengenereres fra den opdaterede favicon-SVG med `magick` (192, 512, maskable 512 med polstring, apple-touch 180).
- `DESIGN.md`: afsnittet "Signaturgradient" opdateres.
- Verificering: Playwright-skærmbilleder af menulinje og login i lyst og mørkt tema.
