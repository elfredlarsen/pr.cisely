## Ændringer

### `src/routes/indstillinger.tsx`
- Ændr `<h2 id="data-heading">Datahåndtering</h2>` → `<h2 id="mine-data-heading">Mine data</h2>`.
- Opdater `aria-labelledby="data-heading"` → `aria-labelledby="mine-data-heading"`.

### `src/components/indstillinger/DataManagementSection.tsx`
- Fjern `<div className="flex justify-center">`-wrapperen omkring AlertDialog. Knappen renderes direkte, så den sidder venstrejusteret ved start af `max-w-md`-blokken — samme placering som "Gem adgangskode" i Konto-sektionen.

## Verifikation
- Sektionsoverskriften viser "Mine data".
- "Gem adgangskode" og "Slet al historik" sidder begge venstrejusteret i bunden af deres formularblok.
