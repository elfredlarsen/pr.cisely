# Automatisk sletning af inaktive konti (2 år) + privatlivspolitik

## Hvad brugeren oplever
- Konti, hvor der ikke er logget ind i 2 år, slettes automatisk sammen med alle data (registreringer, kategorier, indstillinger). Der sendes ingen mail først.
- Ny side **"Privatliv og vilkår"** (`/privatliv`), som kan ses uden login. Der linkes til den fra login-siden (lille link under formularen) og fra Indstillinger (under "Mine data").
- Under "Mine data" i Indstillinger står der kort: "Konti uden login i 2 år slettes automatisk."

## Indhold på siden (dansk, enkelt sprog)
1. Hvem står bag (dataansvarlig: navn/kontakt-mail indsættes som pladsholder, som du skal udfylde)
2. Hvilke data gemmes: e-mail, adgangskode (krypteret), registreringer, kategorier, indstillinger
3. Formål: kun for at få appen til at virke. Ingen reklame, intet salg, ingen sporing
4. Hvor data ligger: hos appens hosting-/databaseudbyder
5. Opbevaring: registreringer slettes efter din valgte periode (standard 30 dage); **konti uden login i 2 år slettes automatisk uden varsel**
6. Dine rettigheder: indsigt, rettelse, sletning (via "Slet al historik" eller kontakt), klage til Datatilsynet
7. Brugervilkår: adgang kun via invitationslink, brug på eget ansvar, ingen garanti for oppetid, vilkår kan ændres
8. Dato for seneste opdatering

## Tekniske detaljer
- Migration: ny funktion `public.delete_inactive_users()` (SECURITY DEFINER, search_path public) som sletter fra `auth.users` hvor `coalesce(last_sign_in_at, created_at) < now() - interval '2 years'`; REVOKE fra PUBLIC/anon/authenticated. Planlægges med pg_cron i samme natlige vindue som opbevaringsjobbet (fx `15 1 * * *`).
- Før migration: bekræft med forespørgsel at `profiles`, `categories` og `measurements` har `ON DELETE CASCADE` til `auth.users`; ellers slettes brugerens rækker eksplicit i funktionen først.
- Ny public route `src/routes/privatliv.tsx` med egen head() (title/description/og-tags), samme kort-stil som login-siden.
- Link tilføjes i `src/routes/login.tsx` og `DataManagementSection.tsx`.
- Verificér: tjek cron-job er aktivt, og at siden vises uden login.
