# Kategorier og registreringer slettes sammen med brugeren

## Hvad du får
- Når en bruger slettes, sletter databasen selv alle brugerens kategorier og registreringer.
- En kategori, der bruges af registreringer, kan stadig ikke slettes i appen. Den kan kun skjules.
- Den natlige oprydning af inaktive konti bliver enklere, men giver samme resultat.
- Ingen eksisterende data ændres eller slettes.

## Trin
1. Tjek, om der findes kategorier eller registreringer, der tilhører en bruger, som ikke findes længere. Hvis der gør, stopper jeg og spørger dig, før jeg gør noget.
2. Tilføj reglerne i databasen:
   - Kategorier hører til en bruger og slettes med den.
   - Registreringer hører til en bruger og slettes med den.
   - Reglen "kategori i brug kan ikke slettes" tjekkes først, når hele sletningen er færdig.
3. Den natlige oprydning sletter kun brugeren. Databasen sletter resten.
4. Kontrol: jeg læser de nye regler i databasen igen og tjekker, at antallet af rækker er uændret. Jeg tjekker også, at det stadig giver den kendte fejlbesked, hvis man sletter en kategori i brug.

## Tekniske detaljer
- `categories_user_id_fkey`: `categories(user_id) → auth.users(id) ON DELETE CASCADE`.
- `measurements_user_id_fkey`: `measurements(user_id) → auth.users(id) ON DELETE CASCADE`.
- `measurements_category_same_user_fkey`: skift fra `ON DELETE RESTRICT` til `ON DELETE NO ACTION` (tjekkes ved slutningen af sætningen). Postgres garanterer ikke rækkefølgen af to kaskader. Med RESTRICT kan sletning af en bruger derfor fejle, fordi en kategori slettes før registreringerne. Direkte sletning af en kategori i brug giver stadig fejl 23503, og appen viser den eksisterende besked.
- Kør som én migration: tilføj de nye fremmednøgler, drop den gamle sammensatte nøgle og opret den igen med NO ACTION. Ingen DML.
- `delete_inactive_users()`: fjern de eksplicitte DELETE-sætninger på measurements og categories. Behold kun `DELETE FROM auth.users`.
- Tjek før migrationen: `LEFT JOIN auth.users` på begge tabeller, hvor `u.id IS NULL`.
- Opdatér ER-dokumentationen, hvis den ligger i projektet.
