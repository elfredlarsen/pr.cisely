# Fjern afhængighed af EXECUTE på has_role i assertAdmin

## Ændring
I `src/lib/categories.functions.ts`, omskriv `assertAdmin` så den ikke kalder `supabase.rpc("has_role", ...)`. I stedet:

- Query `user_roles` direkte med den bruger-scopede klient (RLS-policy "Users can view own roles" tillader dette).
- Select kun `role`-kolonnen, filter på `user_id = userId`.
- Ved DB-fejl: kald `dbError("categories", error)` (uændret mønster).
- Hvis `'administrator'` ikke er blandt rollerne: `throw new Error("Forbidden: administrator role required")` (uændret besked).

Samme mønster som `getMyRoleInfo` i `src/lib/auth.functions.ts`.

## Filer
- `src/lib/categories.functions.ts` — kun `assertAdmin`-funktionen ændres.

## Ikke rørt
- RLS-policies på `categories`.
- `has_role` SQL-funktionen.
- Alle øvrige handlers og signaturer.
