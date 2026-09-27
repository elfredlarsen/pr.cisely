# Fjern rollesystemet helt

Roller bruges ikke længere nogen steder i appen, så det sidste af rollesystemet fjernes fra databasen. Du vil ikke kunne se nogen forskel, når du bruger appen.

## Trin
1. Ny-bruger-funktionen giver ikke længere nye brugere en rolle. Den opretter stadig profilen og kopierer standardkategorierne.
2. Vi sletter rolle-tjekket, rolletabellen og listen over roller (user/administrator).
3. Oversigten over databasen i koden bliver opdateret automatisk.
4. Tjek bagefter:
   - Opret en testbruger og kontrollér, at vedkommende får en profil og 15 kategorier.
   - Slet testbrugeren igen.
   - Kør en sikkerhedsscanning.
   - Test med to brugere, at den ene ikke kan se eller ændre den andens kategorier.

## Tekniske detaljer
- Appens kode bruger hverken `user_roles`, `has_role` eller `app_role`. Det er tjekket i koden, og kun de autogenererede typer nævner dem.
- Migration (det er destruktivt, så du bliver bedt om at bekræfte):
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user() ... -- uden insert i user_roles
  DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
  DROP TABLE IF EXISTS public.user_roles;
  DROP TYPE IF EXISTS public.app_role;
  ```
- Sikkert, fordi den udgivne version ikke længere læser roller.
- Noten i AGENTS.md opdateres, så der står, at appen ikke har noget rollesystem.
