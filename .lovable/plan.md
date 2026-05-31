# Opbevaringsbegrænsning serverside, dovent ved indlæsning

## 1) DB-migration
Tilføj kolonne `retention_days` (smallint, nullable, default null, CHECK `> 0`) til `public.profiles`. `NULL` betyder "aldrig". Ingen rettighedsændringer — eksisterende RLS-policies på `profiles` dækker allerede select/update for egen række.

## 2) Server functions — ny fil `src/lib/retention.functions.ts`
- `getRetentionDays` (GET, `requireSupabaseAuth`): læser `profiles.retention_days` for `userId`. Returnerer `{ retentionDays: number | null }`. Hvis profilrækken mangler → returner `null` (defensive).
- `setRetentionDays` (POST, `requireSupabaseAuth`): zod-valideret input `{ retentionDays: number | null }` (når sat: int, min 1, max 36500). Opdaterer `profiles` med `.eq("id", userId)`. Returnerer `{ ok: true }`.
- `applyRetention` (POST, `requireSupabaseAuth`): læser `retention_days` for brugeren. Hvis `null` → return `{ deleted: 0 }` uden DB-skrivning. Ellers beregn cutoff = `now - retention_days dage` (ISO), kald `supabase.from("measurements").delete().eq("user_id", userId).lt("ended_at", cutoff).select("id")` for at få antal. Returnér `{ deleted: rows.length }`.

Defense-in-depth: alle tre handlers bruger `.eq("user_id", userId)` / `.eq("id", userId)`. Server function kan kun slette egne rækker (RLS + eksplicit filter).

## 3) `useMeasurements` — kald `applyRetention` én gang ved mount
I `useSupabaseMeasurements`: tilføj `useEffect` der kører én gang (guarded med `useRef`) når `enabled === true`. Kalder `applyRetention()` og — hvis `deleted > 0` — invaliderer `QUERY_KEY` så listen genhentes. Fejl swallowed med `console.warn`; UI er ikke afhængig af resultatet. Preview-mode (localStorage) påvirkes ikke.

Vigtigt: ingen automatisk re-run ved hver query/refetch — kun én gang per mount. Det matcher "dovent ved indlæsning" og forhindrer race-conditions hvor brugeren får slettet rækker igen og igen.

## 4) `DataManagementSection`
- Fjern `AUTO_DELETE_KEY` og al `localStorage`-læsning/-skrivning.
- Bevar UI 1:1 (samme `Select` med samme labels og samme "Slet al historik"-knap).
- Mapping: `"never"` ⇄ `null`; `"30"|"60"|"90"|"180"|"365"` ⇄ tilsvarende `number`.
- Brug `useQuery` på `getRetentionDays` til at hydrere initial state. Disable `Select` indtil query er færdig (men bevar UI — kun `disabled`-attribut på `SelectTrigger`).
- `useMutation` på `setRetentionDays`. Ved success: invalider retention-query og vis "Auto-slet opdateret" (uændret tekst). Ved fejl: `toast.error`.
- "Slet al historik" rører ikke retention — kalder fortsat `removeAll()`.

## 5) Sikkerhedskontroller før vi går videre
Inden vi anser arbejdet for færdigt:
- Verificér via direkte SQL-tjek at `applyRetention` med `retentionDays = null` ikke skriver i `measurements`.
- Verificér at `applyRetention` med fx `retentionDays = 365` kun rammer rækker hvor `ended_at < now - interval '365 days'` for den indloggede bruger (manuel test med `select count(*) ... where ended_at < now() - interval '365 days'` før og efter).
- Bekræft i koden at server function altid bruger `.eq("user_id", userId)` og at `getRetentionDays` returnerer `null` første gang en bruger lander på siden (ingen utilsigtet default på fx 30).

## Filer berørt
- `supabase/migrations/...` (ny)
- `src/lib/retention.functions.ts` (ny)
- `src/hooks/use-measurements.ts` (tilføj useEffect i Supabase-grenen + import)
- `src/components/indstillinger/DataManagementSection.tsx` (erstat localStorage med server functions)

## Ikke ændret
- Andet UI, layout, andre indstillinger
- Preview-mode adfærd
- RLS-policies, andre tabeller
- `removeAll`-flowet
