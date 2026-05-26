## Musefølgende tooltip for "Seneste registreringer"

### Fil
`src/components/stopwatch/MeasurementsTable.tsx`

### Ændring
Erstat den nuværende Radix-baserede `<Tooltip>` omkring tabel-sektionen med en custom musefølgende tooltip. Radix Tooltip kan ikke følge musen — derfor en simpel React-implementering.

### Implementering
1. Fjern `<TooltipProvider>`, `<Tooltip>`, `<TooltipTrigger>` og `<TooltipContent>` omkring `<section>`.
2. Tilføj lokal state: `const [tip, setTip] = useState<{ x: number; y: number } | null>(null)`.
3. På `<section>`:
   - `onMouseEnter` / `onMouseMove`: `setTip({ x: e.clientX, y: e.clientY })`
   - `onMouseLeave`: `setTip(null)`
4. Render et `position: fixed` div når `tip !== null`, ved `left: tip.x + 14`, `top: tip.y + 14`:
   - Baggrund: `bg-[#c471ed]/10` (meget let lilla, ca. 10 % opacity)
   - Kant: `border border-[#c471ed]/25`
   - Tekst: `text-[11px] text-muted-foreground/90`
   - `rounded px-2 py-0.5 backdrop-blur-sm shadow-none`
   - `pointer-events-none z-50`
   - Indhold: "Seneste registreringer"

### Ingen ændringer
- Tabellens indhold, kompakte styling og dæmpning (opacity-75) er uændret.
- Tooltips på stopur-knapperne bevares som de er.
- Ingen logik-ændringer.