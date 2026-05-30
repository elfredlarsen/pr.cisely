Tilføj OK- og Annuller-knapper ved redigering af kommentar i tabellerne.

**Ændring** i `src/components/measurements/MeasurementsList.tsx` (linje 524-549, kommentar-redigeringsfeltet):

- Wrap input + nye knapper i en `flex items-center gap-2`.
- Fjern `onBlur`-gemning (så klik på Annuller ikke trigger gem).
- Tilføj to små knapper efter inputtet:
  - **OK** (primary/default variant) → gemmer trimmet værdi via `onUpdate` og lukker editor.
  - **Annuller** (ghost/outline variant) → sætter `setCommentEdit(null)` uden at gemme.
- Behold tastatur-shortcuts: Enter = OK, Escape = Annuller.
- Brug eksisterende `Check` og `X` ikoner fra lucide-react (eller blot tekst-knapper) — holdes diskrete så de matcher tabellens tætte stil.

Ingen ændringer i datamodel eller andre kolonner.