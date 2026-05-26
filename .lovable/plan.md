## Historiktabell — hover-only scrollbar med lilla thumb

### Ændringer

1. **Tilføj custom scrollbar-utility i `src/styles.css`**
   - En klasse `.scrollbar-purple` som:
     - Som standard skjuler scrollbar (`width: 0`, transparent thumb)
     - Ved hover viser en 6 px bred scrollbar med lilla (`#c471ed`) thumb og afrundede kanter
     - Virker i WebKit-browsere via `::-webkit-scrollbar-*`
     - Firefox-fallback med `scrollbar-width` / `scrollbar-color`

2. **Anvend klassen på scroll-container i `src/components/stopwatch/MeasurementsTable.tsx`**
   - Tilføj `scrollbar-purple` på `<div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto …">`

### Tekniske detaljer
- Thumb-farve: `#c471ed` (samme lilla som brand-farven)
- Track: transparent
- Hover-tilstand: thumb bliver synlig, scrollbar-bredde går fra 0 til 6 px
- Ingen nye afhængigheder — bruger ren CSS pseudo-elements