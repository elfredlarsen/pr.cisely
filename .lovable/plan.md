# Fase 1.3 — Empty state + Fase 5.1 — Skeleton loaders

To små UX-forbedringer der spiller sammen: skeletons mens data læses fra localStorage, og venlige tomme tilstande med CTA når der ikke er noget at vise.

## Baggrund

`useMeasurements` læser fra `localStorage` i en `useEffect`, så på første render er `measurements` altid `[]`. Vi kan derfor ikke i dag skelne mellem "indlæser" og "tom" — begge ser ens ud. Det løser vi ved at tilføje en `loaded`-flag i hooket.

## Ændringer

### 1. `src/hooks/use-measurements.ts`
- Tilføj `const [loaded, setLoaded] = useState(false);`
- I init-`useEffect` sættes `setLoaded(true)` efter `setMeasurements(pruned)`.
- Returnér `loaded` i hookets returobjekt.

### 2. `src/components/stopwatch/MeasurementsTable.tsx` (historik på `/`)
- Modtag ny prop `loaded: boolean`.
- Render-rækkefølge:
  - `!loaded` → skeleton-kort (samme `rounded-lg border border-border bg-card` ramme, 3 skeleton-rækker med varierende bredde).
  - `loaded && measurements.length === 0` → erstat den nuværende grå linje med en venligere empty state:
    - Lille ikon (`Timer` fra lucide), overskrift "Ingen registreringer endnu i dag", sekundær tekst "Start stopuret ovenfor for at registrere din første tid", indenfor samme kort-ramme.
  - Ellers: nuværende Collapsible + tabel.

### 3. `src/routes/_authenticated/index.tsx`
- Destrukturér `loaded` fra `useMeasurements()` og videresend til `<MeasurementsTable loaded={loaded} … />`.

### 4. `src/routes/_authenticated/arkiv.tsx` (oversigt)
- Destrukturér `loaded`.
- Render-rækkefølge i tabelområdet:
  - `!loaded` → 2-3 skeleton-`CategoryGroup`-pladsholdere (kort med højde svarende til en lukket gruppe).
  - `loaded && dayMeasurements.length === 0` → erstat den nuværende `<p>Ingen registreringer denne dag</p>` med en empty state:
    - Ikon (`CalendarDays`), tekst "Ingen registreringer denne dag", primær CTA-knap "Tilføj registrering" der kalder `handleAdd()`.
  - Ellers: nuværende kategori-grupper.

### 5. Skeleton-komponent
- Brug eksisterende `@/components/ui/skeleton` (allerede installeret).
- Ingen ny fil nødvendig — skeleton-blokke skrives inline i de to ovenstående komponenter for at undgå over-abstraktion.

## Designnoter

- Empty states beholder samme `rounded-lg border border-border bg-card` ramme som tabelvisningen for at matche memory-reglen om visuel paritet mellem historik og oversigt.
- Skeleton-pulse bruger shadcn's standard `animate-pulse` — ingen ekstra motion-pakke.
- Ingen ændringer i logik eller datalag ud over `loaded`-flag.

## Estimat

~10-15 min samlet. Lav risiko, ingen breaking changes.
