En samlet plan for alle de foreslåede forbedringer, opdelt i faser så vi kan stoppe efter hver fase og evaluere. Hver fase er selvstændig og kan udrulles uafhængigt.

## Fase 1 — Hurtige UX-gevinster (lav risiko, høj værdi)

**1.1 Undo-toast efter sletning**

- I `MeasurementsList.tsx` og `arkiv.tsx`: erstat AlertDialog ved sletning af enkelt-registrering med direkte sletning + `sonner`-toast med "Fortryd"-knap (5 sek).
- AlertDialog beholdes til "Slet alle"-handlingen i `/arkiv` da det er destruktivt.
- Bruger `useMeasurements`-hookens eksisterende `add`/`remove` til at restorere.

**1.2 Tastaturgenveje**

- Ny hook `useKeyboardShortcuts` i `src/hooks/`.
- Globalt på `/` og `/arkiv`: `n` = ny registrering, `/` = fokus søgefelt (når implementeret), `?` = vis hjælp-overlay med alle genveje.
- I `MeasurementsList`: pil op/ned navigerer rækker, `Delete` sletter aktiv række, `c` toggler kommentar, `Enter` redigerer.
- Hjælp-overlay (`Dialog`) listed alle genveje.

**1.3 Tom tilstand**

- I `MeasurementsList`: når der ingen rækker er, vis venlig besked + CTA-knap "Tilføj registrering" (i stedet for tom tabel).
- Lille SVG-illustration der matcher pr:cisely-paletten (cyan/lilla streger).

## Fase 2 — Informationsdesign

**2.1 Søg + filter i historik**

- Sticky bar over historik-tabellen med fritekst-søg (matcher kommentar og kategori) + kategori-multifilter (`Select` med checkboxes).
- Filter-state i URL search params via TanStack Router (`Route.useSearch`) så delbar.

**2.2 Aggregeringer i oversigt**

- I `CategoryGroup`-headeren: vis sum/snit pr. kategori pr. dag (afhænger af om værdier er numeriske — ellers bare antal).
- Diskret typografi (text-xs text-muted-foreground).

**Undlad 2.3 for nu: *2.3 Trend-indikator*** 

- *Ved talværdier i historik: lille ↑/↓ + procent vs. forrige registrering i samme kategori.*
- *Beregnes i komponenten ud fra allerede indlæste data (ingen DB-ændring).*

## Fase 3 — Produktivitet

**3.1 Gentag-knap**

- Tredje ikon-knap pr. række i historik: kopierer værdier til ny registrering (prefiller `MeasurementDialog`).

**3.2 Inline-redigering**

- Dobbeltklik på celle (værdi/kategori/dato) → cellen bliver editable input → Enter gemmer, Escape annullerer.
- Findes delvist allerede for kategori; udvides til værdi og dato.

**3.3 Bulk-handlinger**

- Checkbox-kolonne i historik. Når 1+ rækker valgt: sticky action-bar i bunden med "Slet valgte" og "Skift kategori".

## Undlad fase 4 for nu: *Fase 4 — Data ind/ud*

***4.1 CSV-eksport***

- *Knap i* `/arkiv` *og* `/indstillinger` *→ DataManagementSection: eksporter alle eller filtrerede registreringer.*
- *Ren klient-side generering (Blob + download).*

***4.2 CSV-import***

- *I DataManagementSection: upload CSV → preview → bekræft → batch-insert via Supabase.*
- *Validering med Zod.*

***4.3 Backup/restore JSON***

- *Allerede delvist hvis DataManagementSection findes — bekræftes og udvides hvis nødvendigt.*

## Fase 5 — Polish & performance

**5.1 Skeleton loaders**

- Erstat tomme tabeller under load med skeleton-rækker (shadcn `Skeleton`).

**5.2 Subtile animationer**

- Tilføj `motion`-pakke. Fade+slide ved række-tilføjelse/sletning i tabeller. AnimatePresence omkring `<tr>`.

**5.3 Densitet-toggle**

- I Indstillinger: switch "Kompakt visning" → gemmes i localStorage → reducerer række-padding i tabeller.

## Fase 6 — Platform

**6.1 Kommando-palette (⌘K)**

- `Cmd/Ctrl+K` → `CommandDialog` (shadcn) med: gå til side, opret registrering, skift dato, søg historik.

**6.2 PWA / offline**

- Tilføj manifest + service worker (vite-plugin-pwa).
- Offline-cache af sidste 30 dages historik via IndexedDB; outbox for nye registreringer der synker når online.
- Større arbejde — opdeles i sub-tasks ved opstart.

**6.3 Tilgængelighed-revision**

- Tjek fokus-ringe overalt (alle ghost-knapper har synlig ring).
- `aria-describedby` på AlertDialog'er.
- Kontrasttest af cyan/lilla mod baggrund (særligt på muted-foreground).
- Lighthouse-audit som baseline.

## Anbefalet rækkefølge

Start med **Fase 1** (1-2 dages arbejde, mærkbar effekt) → tag stilling til om vi fortsætter med Fase 2 eller springer til en specifik fase brugeren prioriterer.

Fase 6.2 (PWA) er den eneste tunge — alt andet er rent frontend uden DB-migrationer.

## Hvad jeg IKKE foreslår nu

- Mørk/lys-tema-toggle: appen er allerede mørk og passer til pr:cisely-æstetikken; ville kræve re-tokenisering uden klar gevinst.
- Realtime multi-bruger: ikke nævnt som behov.

---

**Næste skridt**: Sig "Start Fase 1" (eller fx "Spring til Fase 4 — CSV-eksport"), så implementerer jeg den valgte fase.