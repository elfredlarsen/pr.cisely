# Personlige kategorier

Hver bruger får sin egen kategoriliste, som kun vedkommende kan se og ændre. Admin-siden forsvinder.

## Hvad brugeren oplever
- Under Indstillinger > Kategorier kan man oprette, omdøbe, skjule, slette og flytte sine egne kategorier.
- Ændringer påvirker aldrig andre brugere.
- Nye brugere får automatisk en kopi af standardlisten.
- Eksisterende brugere får en kopi af den nuværende liste, så intet forsvinder.
- Aktive kategorier, rækkefølge og senest valgte kategori følger brugeren på tværs af computere.
- Sletning er altid tilladt; gamle registreringer med en slettet kategori viser det interne navn.
- Admin-siden og menupunktet fjernes.

## Trin
1. Database
   - Ny fast skabelontabel med dagens kategorier (kun læsbar via databasefunktion).
   - `user_id` på kategorier; hver eksisterende bruger får en kopi; de gamle fælles rækker fjernes.
   - Kategoriers interne navn skal være unikt pr. bruger (ikke globalt).
   - Nye regler: kun egne kategorier kan ses, oprettes, rettes og slettes.
   - Ny-bruger-funktionen kopierer skabelonen til brugeren og giver kun rollen "user".
   - Nyt felt på profilen til senest valgte kategori.
2. Server-funktioner: kategori-funktionerne arbejder kun på egne rækker; admin-tjek fjernes; ny hent/gem af senest valgte kategori.
3. Brugerflade
   - Opret/omdøb/slet-funktioner flyttes ind i Indstillinger > Kategorier.
   - Stopuret læser og gemmer senest valgte kategori i databasen.
   - Resterende lokale `precisely.activeCategories` / `precisely.lastCategory`-nøgler ryddes.
   - Admin-side, menupunkt og rolle-hook fjernes.
4. Verifikation: test med to brugere i browseren, at ændringer er isolerede, og kør sikkerhedsscanning.

## Tekniske detaljer
- `category_templates(value, label, sort_order)` seedet fra nuværende `categories`.
- `categories.user_id uuid not null`; unik `(user_id, value)`; RLS `auth.uid() = user_id` for alle fire operationer; index på `user_id`.
- Backfill: `INSERT ... SELECT` pr. bruger fra nuværende rækker, derefter sletning af rækker uden `user_id` (kræver din bekræftelse).
- `handle_new_user()` udvides med kopi fra `category_templates`.
- `profiles.last_category text`.
- Administratorrollen: admin-policies fjernes og rækker med rollen slettes. Selve enum-værdien `administrator` og `has_role` bevares inaktive (markeret DEPRECATED), fordi fjernelse ville knække den udgivne version indtil ny publicering; kan fjernes helt bagefter.
- Filer: `categories.functions.ts`, `use-categories.ts`, `CategoriesSection.tsx`, `Stopwatch`/`MeasurementDialog`, `TopNav.tsx`, slet `admin.tsx`, `auth.functions.ts`, `use-my-role.ts`; ny `last-category.functions.ts`.
