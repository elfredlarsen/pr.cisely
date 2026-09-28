# Oprydning: færre serverkald for kategorier

Appen virker som før for brugeren — samme rækkefølge, samme skjul/vis — men henter kategorierne ét sted i stedet for tre.

## Hvad ændres
1. **Rækkefølge:** Det tomme serverkald for rækkefølge fjernes, og appen sorterer ikke længere selv — databasen leverer allerede den rigtige rækkefølge.
2. **Aktive kategorier:** Udledes direkte af den kategoriliste, der allerede hentes (dem der ikke er skjult). Det separate kald fjernes.
3. **Samling:** Gem-rækkefølge og gem-aktive flyttes ind i den fælles kategori-fil; de to separate filer slettes.

## Teknisk
- `src/lib/categories.functions.ts`: tilføj `setCategoryOrder` og `setActiveCategories` (uændret logik). Slet `category-order.functions.ts` og `active-categories.functions.ts` (`getCategoryOrder`/`getActiveCategories` udgår).
- `src/hooks/use-categories.ts`: fjern `useCategoryOrder`, `applyOrder`, `CATEGORY_ORDER_QUERY_KEY`; `useInvalidateCategoryOrder` → `useInvalidateCategories` (invaliderer `["categories"]`).
- `src/hooks/use-active-categories.ts`: `useActiveCategoriesFilter()` bygges på `useCategories()` — returnerer `null` hvis ingen er skjulte, ellers værdierne for `!hidden`. Fjern query/invalidate-hooks.
- `CategoriesSection.tsx`: filter udledes af `categories[].hidden`; gem-kald importeres fra `categories.functions.ts`; invalidering via `useInvalidateCategories`.
- `MeasurementsList.tsx` og `MeasurementDialog.tsx`: uændret API (`useActiveCategoriesFilter`).
- Verifikation: build + klik i Indstillinger (flyt og skjul/vis en kategori, og tilbage igen) samt Stopur/Oversigt.
