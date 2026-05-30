Gør "Vis kommentar"-knappen og trash-knappen lige brede i `MeasurementsList`. Da både historik (`/`) og oversigt (`/arkiv` via `CategoryGroup`) renderer denne komponent, opdateres begge tabeller med én ændring.

## Ændring

**`src/components/measurements/MeasurementsList.tsx`** (linje 473)
- Vis kommentar-knap: skift `h-9 w-auto gap-0.5 px-2` → `h-9 w-16 justify-center gap-0.5 px-0` så den får samme faste bredde (64px) som trash-knappen.
- Trash-knap (linje 497) er uændret (`w-16`).
- Hover-stil, chevron og notifikations-prik bevares.

Resultat: Begge handlings-knapper har præcis 64px bredde — både i historik og i oversigt.