## Mål
Alle knapper i appen skal følge samme "state-sprog" som vist i Figma-referencen:

- **Default**: grundfarve, fuld opacitet, evt. border
- **Hover**: subtilt farveskift / let shadow-lift
- **Active (pressed)**: mørkere fill + scale 0.98
- **Focus-visible**: tydelig 3px ring med offset
- **Disabled**: dæmpet fill, lav kontrast, `cursor: not-allowed`

I dag har hver knap sin egen ad-hoc kombination (forskellig focus-ring, ingen aktiv-state, ingen scale-feedback, inkonsistent disabled). Vi ensretter dem.

## Berørte filer
- `src/components/ui/button.tsx` (shadcn-base)
- `src/components/stopwatch/Stopwatch.tsx` (Start/Pause/Fortsæt/Nulstil/Afslut — `baseBtn`)
- `src/components/stopwatch/FinishPanel.tsx` (Annuller, Gem)
- `src/components/stopwatch/MeasurementsTable.tsx` (Ryd historik, skjul-ikon, in-line redigerings-knapper)
- `src/components/stopwatch/TopNav.tsx` (verificeres og opdateres hvis nødvendigt)

## Ændringer

### 1. Fælles "interaction"-klasse i `button.tsx`
Tilføj til `buttonVariants` base-classes så ALLE shadcn-knapper får:
- `active:scale-[0.98] active:brightness-95` (pressed feedback)
- `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` (erstatter nuværende `ring-1` uden offset)
- `disabled:cursor-not-allowed disabled:opacity-60` (allerede `disabled:opacity-50` — strammes til 60% + cursor)
- `transition-all duration-150` så hover/active føles ensartet

### 2. Stopwatch hovedknapper (`baseBtn`)
Opdatér `baseBtn` så den matcher reference-sproget:
- Behold størrelse/farver pr. variant (success/destructive/warning/info)
- Hover: `hover:brightness-110 hover:shadow-md` (allerede tæt på)
- Active: tilføj `active:scale-[0.98] active:brightness-90`
- Focus: harmoniser til `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Disabled-klasser (selv om knapperne sjældent disables)

### 3. FinishPanel "Annuller" + "Gem"
- Erstat de håndskrevne klasser med `<Button variant="outline">` og `<Button>` (default/primary) fra shadcn — så de automatisk arver det nye state-sprog.
- Bevarer dansk tekst og `min-h-11` for touch-target via `size` eller ekstra className.

### 4. MeasurementsTable
- **"Ryd historik"**: erstat custom-knap med `<Button variant="ghost" size="sm">` + Trash-ikon, beholder `whitespace-nowrap`.
- **Skjul-øje (rækken)**: erstat med `<Button variant="ghost" size="icon">`.
- **In-line tids/varigheds-knapper (blyant-hover)**: behold custom layout (de er bevidst usynlige indtil hover), men tilføj `active:scale-[0.98]` og samme focus-ring som resten.

### 5. TopNav
Gennemgå evt. knapper og brug `<Button>` variants i stedet for ad-hoc, hvis ikke allerede.

## Resultat
Hver knap i appen — uanset variant — opfører sig forudsigeligt: samme hover-løft, samme "tryk-ned" feedback, samme synlige fokus-ring, samme disabled-look. Den primære farve/størrelse er stadig fri pr. variant, men interaktions-laget er ét fælles sprog.

## Ikke i scope
- Ingen ændringer af farve-palette eller layout
- Ingen funktionelle ændringer (klik-handlers, state, data)
