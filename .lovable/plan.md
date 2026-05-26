## Ændring: Grålige tekstfarver i measurements-tabellen

### Problem
Tabellen bruger i dag standard-tekstfarven (`text-foreground`, nær-sort), hvilket gør den visuelt dominerende og tager fokus fra stopuret.

### Løsning
Alle tekstelementer i `MeasurementsTable` justeres til at bruge `text-muted-foreground` (den grålige nuance fra designsystemet) i stedet for den mørke default:

1. **TableHead** (kolonneoverskrifter: Start, Slut, Varighed, Kategori): tilføj `text-muted-foreground`
2. **Tids- og varighedsknapper** i cellerne: tilføj `text-muted-foreground`
3. **SelectTrigger** (kategorivælger): tilføj `text-muted-foreground`
4. Eksisterende elementer med `text-muted-foreground` beholdes som de er:
   - "Ingen registreringer endnu i dag"
   - "Ryd historik"-knap
   - Tooltip-indhold
   - Skjul-ikonknap

### Teknisk
Ændringer i `src/components/stopwatch/MeasurementsTable.tsx` — kun Tailwind-klasser på 4 elementtyper. Ingen logikændringer.