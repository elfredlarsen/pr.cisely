## Mål
1. Bekræft kategoriændring via dialog inden ændring gemmes.
2. Gør Start, Slut og Varighed kolonnerne i hver kategoritabel sorterbare.

## Ændringer

### `src/components/oversigt/CategoryGroup.tsx`

**Bekræft kategoriskift**
- Tilføj lokal state `pendingCategoryChange: { id: string; to: Category } | null`.
- I `<Select onValueChange>`: hvis ny værdi ≠ nuværende, sæt `pendingCategoryChange` i stedet for at kalde `onUpdate` direkte.
- Render `<AlertDialog>` styret af `pendingCategoryChange != null`:
  - Titel: "Skift kategori?"
  - Beskrivelse: "Fra **{nuværende label}** til **{ny label}**."
  - Annuller → luk dialog (Select er kontrolleret af `m.category`, så den falder selv tilbage).
  - Bekræft → `onUpdate(id, { category: to })` og luk.

**Sortering**
- Tilføj lokal state `sort: { field: "start" | "end" | "duration"; dir: "asc" | "desc" }` (default `{ field: "start", dir: "asc" }` — matcher nuværende rækkefølge).
- Erstat `items` direkte med `sortedItems` (useMemo) der sorterer efter:
  - `start` → `new Date(startedAt).getTime()`
  - `end` → `new Date(endedAt).getTime()`
  - `duration` → `ms`
- Gør `<TableHead>` for Start/Slut/Varighed til klikbare knapper:
  - Klik på aktiv kolonne → toggle dir.
  - Klik på inaktiv kolonne → sæt field, dir = `asc`.
  - Vis en lille pil (ArrowUp/ArrowDown fra lucide) ved siden af kolonnetitlen for det aktive sorteringsfelt.
- Kategori-kolonnen forbliver usorterbar.
