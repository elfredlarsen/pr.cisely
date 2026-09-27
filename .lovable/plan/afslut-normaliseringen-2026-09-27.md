# Afslut normaliseringen

De tre gamle kolonner (category_order, active_categories, last_category) er nu væk fra profilerne. Databasen og appen bruger kun kategoriernes egen rækkefølge og skjul-markering samt den faste henvisning til den senest valgte kategori.

## Tilbage at gøre

1. Opdatér projektnoterne, så de beskriver den nye struktur (rækkefølge og skjult på kategorierne, senest valgt som henvisning).
2. Ryd opgavelisten for de færdige normaliseringspunkter.
3. Gem det opdaterede ER-diagram i projektet som fast dokumentation (med last_category_id og de to CHECK-regler).
4. Klik appen igennem: skjul/vis og flyt kategorier i Indstillinger, tilføj registrering (senest valgte kategori forvalgt), stopur og oversigt.

## Tekniske detaljer

- `AGENTS.md`: behold én regel om kategoripræferencer; fjern forældet tekst om profiles-arrays.
- `roadmap.md`: markér normaliseringen som færdig.
- Ny fil `docs/er-diagram.md` med Mermaid-diagrammet (hvert felt på egen linje).
- Playwright-test med den eksisterende testsession.
