## Gennemsigtige, diskrete tooltips

I `src/components/stopwatch/Stopwatch.tsx` ændres `ShortcutTooltip` komponenten så tooltip'erne bliver visuelt diskrete:

- The tooltip should have a short delay before appearing (around 300ms), and use a small, dark, minimal style. Do not add any visible text or badge to the button itself — the tooltip should only appear on hover.

1. **Baggrund**: `bg-background/80 backdrop-blur-sm` — semi-transparent med let sløring, så baggrunden skinner igennem.
2. **Tekst**: `text-muted-foreground` i stedet for `text-primary-foreground`, så teksten er afdæmpet og neutral.
3. **Størrelse**: Reducer padding til `px-2 py-1` og tekststørrelse til `text-[11px]`.
4. **Afstand**: Reducer `sideOffset` til `2` så tooltip'en sidder tættere på knappen.
5. **Animation**: Beholder fade-in, men fjerner zoom-effekten for at undgå det visuelle "pop".
6. **Border**: Tilføjer en subtil `border border-border/50` for let definition.

Resultat: Tooltip'en er synlig, men træder i baggrunden og virker som en del af knappen frem for en separat UI-komponent.