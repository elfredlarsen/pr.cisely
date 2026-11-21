# Slet min konto

## Det oplever brugeren
- Nederst i "Mine data" i Indstillinger kommer en rød knap: **Slet min konto**.
- Knappen åbner en dialog. Den forklarer, at alle registreringer, kategorier og selve kontoen slettes permanent og ikke kan fortrydes. Knappen "Slet konto" virker først, når man har skrevet **slet** i feltet.
- Når kontoen er slettet, bliver man logget ud og sendt til login-siden. Der står beskeden "Din konto er slettet".
- Privatlivssiden siger nu, at du selv kan slette din konto under Indstillinger. Sætningen om at skrive til kontaktmailen for at slette kontoen bliver fjernet.
- Alt kan bruges med tastaturet: Tab, Enter og Esc virker, og det er tydeligt, hvor du er på siden.

## Tekniske detaljer
- Ny databasefunktion `public.delete_my_account()`. Den bygger på samme mønster som `delete_inactive_users`, men sletter kun den bruger, der er logget ind (`auth.uid()`). Den sletter `mtime_entries`, `measurements`, nulstiller `profiles.last_category_id`, og sletter derefter `categories`, `profiles` og `auth.users`. EXECUTE gives kun til `authenticated`.
- Ny serverfunktion `deleteMyAccount` i `src/lib/account.functions.ts`. Den bruger `requireSupabaseAuth` og kalder RPC'en via brugerens egen klient, så serverens administratoradgang ikke bruges.
- `DataManagementSection.tsx`: AlertDialog med inputfelt. Efter sletning: `signOut`, query-cachen ryddes, og man sendes til `/login?deleted=1`.
- `login.tsx`: viser beskeden ved `?deleted=1`.
- `privatliv.tsx`: punktet om rettigheder opdateres.
- Ingen tabeller ændres. Derfor bliver ER-diagrammet ikke ændret.
