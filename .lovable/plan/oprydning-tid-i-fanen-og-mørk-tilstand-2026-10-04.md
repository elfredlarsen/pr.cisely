# Oprydning, tid i fanen og mørk tilstand

Rækkefølge: oprydning, derefter fane-tid, til sidst mørk tilstand.

## 1. Teknisk oprydning
- Slet de 27 byggeklodser, som appen aldrig bruger (bl.a. sidebar, chart, menubar, drawer, carousel, tabs, slider, progress m.fl.) samt hjælpefilen, der kun bruges af sidebar.
- Fjern pakker, der derefter ikke bruges længere.
- Ret den manglende afhængighed i gem-vinduet (senest valgte kategori).
- Opdatér roadmap med de tre nye punkter.

## 2. Løbende tid i browserfanen
- Mens stopuret kører: fanetitlen viser fx `▶ 00:23:45 · pr:cisely`.
- På pause: `⏸ 00:23:45 · pr:cisely`.
- Nulstillet: sidens normale titel kommer tilbage.
- Opdateres én gang i sekundet (ikke hvert billede), så det ikke belaster.
- Virker på alle sider, mens man er logget ind.

## 3. Mørk tilstand
- Ny boks "Udseende" i Indstillinger med tre valg: Lyst, Mørkt, Følg systemet (standard).
- Valget huskes på enheden, så siden ikke blinker lyst ved indlæsning.
- Mørke farver for alle flader, tekst, kanter og stopurets knapper — alle med mindst 4,5:1 kontrast.
- Logo-gradient bevares.
- DESIGN.md opdateres med de mørke farver.

## Tekniske detaljer
- Fane-tid: lille effekt i StopwatchProvider, der sætter `document.title` ud fra status/displayMs (afrundet til sekunder) og gendanner den oprindelige titel.
- Mørk tilstand: `.dark`-klasse på `<html>`; variant findes allerede i styles.css. Mørke tokens under `.dark`. Tema gemmes i localStorage (ren UI-præference, ikke data) og sættes med et lille inline-script i `__root.tsx` før første tegning; "system" følger `prefers-color-scheme` live.
- Afprøves i browseren: fanetitel under kørsel/pause og alle tre temaer på Stopur, Oversigt, Indstillinger og Login.
