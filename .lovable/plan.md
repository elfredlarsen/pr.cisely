# Fjern sideoverskrifter og tydeligere menu

## Hvad ændres
1. **Overskrifterne "Oversigt" og "Indstillinger" fjernes visuelt**, så indholdet rykker op mod menulinjen. Skærmlæsere hører dem stadig. Privatlivssiden beholder sin synlige overskrift (den er ikke i menuen).
2. **Menupunkterne bliver større og tydeligere:**
   - Større tekst (16 px i stedet for 14 px) og lidt federe.
   - Større klikflade (44 px høj) og mere afstand mellem punkterne.
   - Det aktive punkt får en tydelig lys lilla baggrund ud over stregen under.
   - Menulinjen bliver lidt højere (72 px) for at give luft.
   - På små skærme (telefon) holdes størrelsen fornuftig, så intet skubbes ud over kanten.
3. Kontrolleres i lyst og mørkt tema på computer og telefon.

## Teknisk
- `PageHeader`: ny prop `srOnly` der giver `<h1 className="sr-only">` uden beskrivelse; bruges i `oversigt.tsx` og `indstillinger.tsx`.
- `TopNav.tsx`: `h-18`, `ul gap-2`, links `min-h-11 px-5 text-base font-semibold`, aktiv `bg-primary/10 text-foreground`; mobil `max-[640px]:px-3 max-[640px]:text-sm`.
- `styles.css`: `.nav-link::after` tilpasses ny padding.
- Playwright-tjek 1280 px og 390 px, lyst/mørkt.
