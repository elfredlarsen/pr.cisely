## Mål
Gør tidsfelter (Start, Slut, Varighed) i historiktabellen tydeligt redigerbare og forhindr layout-hop ved klik.

## Ændringer i `src/components/stopwatch/MeasurementsTable.tsx`

### 1. Visuel hover-indikator
- Importer `Pencil` fra `lucide-react`.
- I `renderTimeCell` og `renderDurationCell` (visningstilstand):
  - Wrap knappens indhold i `<span className="inline-flex items-center gap-1">` med tids-teksten + et `<Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />`.
  - Tilføj `group` til knappen + `hover:bg-accent/60` (allerede til stede) så baggrund + blyant vises samtidig ved hover.

### 2. Faste bredder (intet layout-hop)
- Start/Slut-celler: brug `w-24` (96px) – nok til `HH:MM:SS` + blyant i mono font.
- Varighed-celle: brug `w-24` også.
- På visningsknapperne: tilføj `inline-flex w-full justify-start` så knappen fylder cellen og blyanten ikke skubber tekst.
- På input-felterne i edit-tilstand: ret `w-28`/`w-24` til samme bredde som visning (`w-full` inde i cellen, evt. `min-w-[88px]`), så bredden er identisk i begge tilstande.
- TableHead for Start/Slut/Varighed har allerede `w-24` — bekræft konsistens; juster om nødvendigt.

### 3. Detaljer
- Bevar `text-muted-foreground` og `font-mono tabular-nums` så tegnbredden er stabil.
- Blyant-ikon skjules i fokus/edit-tilstand (kun synligt ved hover på visningsknap).
- Ingen ændringer i edit-logik, parsing eller business logic.

## Resultat
Brugeren ser en blyant + let baggrund ved hover på tidsværdier, og cellen ekspanderer ikke når input'et åbner.
