# Fjern tallene 1–9 ved kategorierne

## Ændring
I kategorivælgeren i vinduerne "Gem registrering" og "Tilføj registrering" fjernes de små talbokse (1–9) til venstre for kategorinavnene. Listen viser derefter kun navnene.

## Uændret
Tastaturgenvejene virker stadig, fordi de kun er skjulte: når vinduet er åbent, vælger tasterne 1–9 stadig de første ni kategorier.

## Tekniske detaljer
- `src/components/oversigt/MeasurementDialog.tsx` linje 348–352: `{i < 9 && <span>…</span>}` fjernes. Indekset `i` i map-funktionen fjernes, da det ikke længere bruges.
