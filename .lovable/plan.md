## Mål

Gør `/admin` visuelt konsistent med `/indstillinger` og udskift "skjul/vis" med rigtig **tilføj/slet** af kategorier. Historiske registreringer (gemt i browserens lokale storage med kategori-`value` som streng) er upåvirkede når en kategori slettes — etiketten falder bare tilbage til `value`.

## Layout (inspireret af indstillinger)

`/admin` får samme struktur som indstillinger-siden:

- `max-w-6xl` main, centreret
- Et grid med kort i `border border-border bg-card p-6 rounded-lg`
- Centreret header (`text-lg font-semibold` + muted beskrivelse)
- Samme listestil som `CategoriesSection` (scrollbar-purple, divide-y, rounded border, fade-overlays top/bund)

To kort side om side på desktop (`lg:grid-cols-2`), stablet på mobil:

1. **Kategorier** — liste over eksisterende kategorier; hver række har inline redigerbart navn + en sletteknap (trash-ikon) der åbner en bekræftelses-dialog.
2. **Tilføj kategori** — lille formular med ét tekstfelt (navn) + "Tilføj"-knap. `value` (slug) genereres automatisk fra navnet (lowercase, æøå→ae/oe/aa, ikke-alfanumerisk → `_`), med kollisions-suffix hvis nødvendigt. `sort_order` sættes til `max+1`.

## Datalag

**Migration** (skema):
- Tilføj RLS-policies på `public.categories`:
  - `INSERT` for administratorer
  - `DELETE` for administratorer
- (`UPDATE`/`SELECT` findes allerede.)
- `hidden`-kolonnen bevares uændret for nu (ingen kode bruger den længere efter denne ændring, men vi rører den ikke for at undgå unødig migration).

**Server-funktioner** (`src/lib/categories.functions.ts`):
- `createCategory({ label })` — admin-tjek via `has_role`, generer unik `value`, beregn `sort_order`, insert.
- `deleteCategory({ id })` — admin-tjek, slet række. Returnerer `{ ok: true }`. Historiske målinger berøres ikke (de lever i localStorage).
- Behold `updateCategory` til omdøbning. Fjern `hidden`-feltet fra dets schema (bliver ikke længere brugt fra UI).
- `listCategories` uændret.

## UI-ændringer

**`src/routes/_authenticated/admin.tsx`** omskrives:
- Samme indlednings-tjek (loading + admin-redirect) som nu.
- Ny `AdminContent` med to-kolonners grid som beskrevet.
- `CategoryAdminRow`: fjern `Eye/EyeOff` + `Switch`. Behold inline navn-redigering (blur/Enter gemmer). Tilføj `Trash2`-knap der åbner `AlertDialog` ("Slet kategorien '<label>'? Historiske registreringer berøres ikke."). Bekræft → kald `deleteCategory` → invalider `["categories"]`.
- Ny `AddCategoryForm`: input + "Tilføj"-knap. Disabler ved tom input. Ved success: ryd input, invalider `["categories"]`, toast "Kategori tilføjet".

**`src/components/indstillinger/CategoriesSection.tsx`**:
- Erstat `.filter((c) => !c.hidden)` med direkte brug af `categories ?? []` (siden vi ikke længere skjuler — slettede kategorier er væk fra listen).

**`src/hooks/use-categories.ts`**:
- `useVisibleCategories` returnerer nu bare alle kategorier (fjern `hidden`-filter). Beholdes for at undgå at røre call-sites.

**`src/lib/categories.ts`**:
- Uændret. `fallbackCategoryLabel(value)` håndterer allerede ukendte/slettede kategorier ved at vise selve `value`.

## Tekniske detaljer

- Slug-generering server-side i `createCategory`:
  ```
  æ→ae, ø→oe, å→aa, lowercase, /[^a-z0-9]+/g → "_", trim "_"
  ```
  Hvis værdien allerede findes, append `_2`, `_3`, …
- Validering: `label` 1–80 tegn.
- `AlertDialog` bruges til sletning (allerede i `components/ui`).
- Sletning af kategori invaliderer kun `["categories"]`-query — målingerne i UI ændres ikke (deres `category`-streng bevares; etiketten bliver til `value` via fallback).

## Ingen ændringer i

- Stopur, oversigt, arkiv, indstillinger ud over linjen nævnt ovenfor.
- Måleskemaet/local storage.
- Auth-flow.
