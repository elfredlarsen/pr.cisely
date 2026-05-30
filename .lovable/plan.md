## Mål
Tilføj rigtig login + en `/admin`-rute hvor administratorer kan omdøbe og skjule kategorier. Almindelige brugere ser hverken ruten eller nav-linket.

## 1. Backend (Lovable Cloud)

Aktivér Cloud, og opret følgende skema via migration:

**`profiles`** — auto-oprettes ved signup (trigger på `auth.users`):
- `id uuid PK → auth.users(id) on delete cascade`
- `email text`, `created_at timestamptz default now()`

**`app_role` enum**: `'administrator' | 'user'`

**`user_roles`** — adskilt fra profiles (ingen privilege escalation):
- `id uuid PK`, `user_id uuid → auth.users`, `role app_role`, unique(user_id, role)

**`has_role(_user_id, _role)`** SECURITY DEFINER-funktion (forhindrer rekursiv RLS).

**`categories`** — erstatter den hardcoded liste:
- `id uuid PK`, `value text unique not null` (stabil nøgle brugt af registreringer),
- `label text not null`, `sort_order int not null default 0`,
- `hidden boolean not null default false`,
- `created_at`, `updated_at`.
- Seedes med de 13 nuværende værdier i samme migration.

GRANTs + RLS:
- `categories`: alle authenticated kan `SELECT`; kun admin kan `UPDATE` (`has_role(auth.uid(),'administrator')`). Ingen INSERT/DELETE (jf. beslutning: kun omdøbe + skjule).
- `profiles`: bruger kan læse/opdatere egen række.
- `user_roles`: bruger kan læse egne roller; kun service_role kan skrive (admins tildeles manuelt i DB indtil videre).

Auth-konfiguration: email/adgangskode, `emailRedirectTo: window.location.origin`. HIBP-tjek aktiveret.

## 2. Auth-flow i frontend

- `/login` (offentlig): email + password, sign-in/sign-up toggle. Bruger `supabase.auth.signInWithPassword` / `signUp`.
- Root `__root.tsx`: registrer `onAuthStateChange` én gang, opdater router-context med `{ isAuthenticated, userId, isAdmin }`. `isAdmin` hentes via server-fn der kalder `has_role`.
- `_authenticated` pathless layout: `beforeLoad` redirecter til `/login` hvis ikke logget ind. Flyt `/`, `/arkiv`, `/indstillinger` under `_authenticated/`.
- `_authenticated/admin.tsx`: `beforeLoad` redirecter til `/` hvis `!isAdmin`.
- Eksisterende "Log ud"-knap i `TopNav` får handler: `supabase.auth.signOut()` + navigate til `/login`.

## 3. /admin-siden

Egen rute med samme layout som `/indstillinger` (TopNav + centreret card):
- **Kategorier-tabel** med kolonner: Navn (inline-redigerbar input), Synlig (switch), Rækkefølge (drag handle eller op/ned-knapper).
- "Gem"-knap pr. række eller debounce-autosave; toast ved succes.
- Server-fn `updateCategory({ id, label?, hidden?, sort_order? })` beskyttet med `requireSupabaseAuth` + admin-tjek i handler.

## 4. Migrér frontend fra hardcoded kategorier

`src/lib/categories.ts` ændres:
- `CATEGORIES` udfases. I stedet ny hook `useCategories()` der bruger TanStack Query mod en server-fn `listCategories()` (returnerer ikke-skjulte kategorier sorteret efter `sort_order`).
- `categoryLabel(value)`: opslag i den hentede liste (med fallback til værdien).
- `Category`-typen bliver `string` (ikke længere en union), da kategorier nu er dynamiske. Registreringer gemmer fortsat `value`-strengen.
- `getActiveCategories`/`setActiveCategories` (per-bruger filter i Indstillinger) beholdes men filtreres mod den dynamiske liste.

Komponenter der skal opdateres til at bruge hooken: `CategoriesSection`, `MeasurementDialog`, `CategoryGroup`, `Stopwatch` (kategori-vælger), og evt. format/filter-helpers.

## 5. TopNav

Vis "Admin"-link i nav-listen kun hvis `auth.isAdmin`. Ellers uændret design.

## Verifikation
- Ikke-logget-ind bruger på `/` → redirectes til `/login`.
- Almindelig bruger ser ikke "Admin"-link og kan ikke tilgå `/admin` direkte (redirect).
- Admin kan omdøbe "Biometri" → ændringen slår igennem i alle kategori-dropdowns uden reload (query invalidation).
- Admin kan skjule en kategori → forsvinder fra dropdowns; eksisterende registreringer med den værdi viser stadig det gemte navn.
- "Log ud" virker og rydder session.

## Åbne spørgsmål (kan håndteres efter implementering)
- Hvordan udnævnes den første administrator? Forslag: manuelt SQL-insert i `user_roles` efter du har oprettet din konto — jeg giver dig kommandoen efter login virker.
