Knapperækken skal aldrig være bredere end urets faktiske visuelle bredde (kanten af første "0" til kanten af sidste ciffer).

**Løsning** i `src/components/stopwatch/Stopwatch.tsx`:
- Tilføj en `ref` på `TimeDisplay`-wrapperen og mål dens faktiske bredde med `ResizeObserver`.
- Sæt knapperækkens `maxWidth` til den målte bredde via inline style, og behold `mx-auto justify-between` så de tre knapper fordeles inden for præcis den bredde.
- Når der kun er én knap (idle), bruges `justify-center` så Start-knappen står midt under uret.

Ingen ændringer i `TimeDisplay`, knapstørrelser eller funktionalitet.