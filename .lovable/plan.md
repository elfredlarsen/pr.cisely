Justeringer i `src/components/stopwatch/Stopwatch.tsx`:

1. **Samme start/slut for ur og knapper**: Wrap knapperækken i en indre container med samme bredde som tidsvisningen, og brug `justify-between` så første og sidste knap flugter med urets venstre/højre kant. Når der kun er én knap (idle-state), bruges `justify-center` så Start-knappen ikke sidder klistret i venstre side.

2. **Lidt større elementer**:
   - Knapper (`baseBtn`): `h-12 w-40 text-lg` → `h-14 w-44 text-xl`, ikoner `h-6 w-6` → `h-7 w-7`.
   - Container `max-w-2xl` → `max-w-3xl` så uret og knaprækken matcher tabellens bredde bedre.
   - TimeDisplay forstørres en anelse via dens egen tekststørrelse (tjekker filen og bumper én tier op, fx `text-7xl` → `text-8xl`).

Ingen ændringer i logik, keyboard shortcuts eller funktionalitet.