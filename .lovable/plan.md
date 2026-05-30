
## Mål

Bygge Konto-sektionen på en ny Indstillinger-side med en "Skift adgangskode"-formular. Al tekst på dansk, design følger `DESIGN.md` (Poppins, lilla #c471ed som primær, afrundede inputs, hover/fokus-tilstande, min. 44px klikflader, kontrast ≥ 4.5:1).

## Forudsætninger / antagelser

- Der er endnu ingen auth-backend i projektet, og brugeren har ikke bedt om at koble til Lovable Cloud i denne prompt. "Gem adgangskode" implementeres derfor som en **frontend-only mock**, der validerer felterne og viser bekræftelsen via sonner-toast. Når Lovable Cloud auth tilkobles senere, byttes mock-handleren ud med `supabase.auth.updateUser({ password })` — komponentens API ændres ikke.
- Siden lægges på ruten `/indstillinger`, så TopNav-linket "Indstillinger" kan pege på en rigtig rute.

## Ændringer

### 1. Ny rute: `src/routes/indstillinger.tsx`
- `createFileRoute("/indstillinger")` med `head()` der sætter unik `<title>` ("Indstillinger — pr:cisely") og meta-description på dansk.
- Layout matcher de eksisterende sider (`TopNav` + centreret max-bredde container med padding).
- Én `<h1>` "Indstillinger".
- Sektion "Konto" som `<section aria-labelledby="konto-heading">` med `<h2 id="konto-heading">Konto</h2>` og kort beskrivelse.
- Indeholder underafsnit "Skift adgangskode" der renderer den nye `ChangePasswordForm`. Strukturen tillader nemt at tilføje flere konto-underafsnit (fx e-mail, slet konto) senere uden ny rute.

### 2. Ny komponent: `src/components/indstillinger/ChangePasswordForm.tsx`
- Tre `<Input>`-felter stacket lodret med labels:
  - "Nuværende adgangskode"
  - "Ny adgangskode"
  - "Bekræft ny adgangskode"
- Hvert felt har en vis/skjul-toggle-knap inde i feltet (absolut-positioneret `Button variant="ghost" size="icon"` med Lucide `Eye` / `EyeOff`-ikon). Knap er ≥ 44×44 og har `aria-label` "Vis adgangskode" / "Skjul adgangskode" der opdateres efter tilstand. Hvert felt har egen toggle-state.
- Mindst 8px luft mellem klikbare elementer (felter, toggle, gem-knap) via `space-y-4`.
- Validering (zod + react-hook-form, samme stack som projektets `ui/form.tsx`):
  - Alle tre felter påkrævet.
  - Ny adgangskode min. 8 tegn (fornuftig default; nævnes som hjælpetekst under feltet).
  - `nyAdgangskode === bekræftNyAdgangskode`, ellers fejlbesked "Adgangskoderne stemmer ikke overens" knyttet til bekræft-feltet.
- "Gem adgangskode"-knap (`<Button>` primær, lilla accent fra eksisterende tema-token) under felterne. Disabled mens submit kører.
- Submit-handler (mock): simulerer en kort async-pause, og ved succes viser `toast.success("Adgangskode opdateret")` via sonner og nulstiller formularen. Ved mismatch forhindrer zod submit og viser fejlen inline; ingen toast.
- Ingen logging af adgangskodeværdier til konsol; ingen send til eksterne endpoints.

### 3. Wire-up i TopNav: `src/components/stopwatch/TopNav.tsx`
- Skift `{ label: "Indstillinger", icon: Settings, to: null }` til `to: "/indstillinger" as const`, så menupunktet linker til den nye rute. Øvrige `null`-poster (Hjælp, Log ud) rører vi ikke.

### 4. `routeTree.gen.ts`
- Autogenereres af TanStack Router Vite-pluginnet når den nye route-fil oprettes — vi rører den ikke manuelt.

## Tekniske noter

- Bruger eksisterende UI-primitiver: `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`, `@/components/ui/form` (react-hook-form wrappers), `sonner` toast.
- Ikoner: `Eye`, `EyeOff` fra `lucide-react`.
- Toggle implementeres ved at sætte `<Input type={visible ? "text" : "password"} className="pr-11">` og placere toggle-knappen i en `relative`-wrapper med `absolute right-1 top-1/2 -translate-y-1/2`.
- Ingen nye dependencies kræves (zod, react-hook-form, sonner, lucide-react er allerede i projektet jf. eksisterende komponenter).

## Verifikation

- `/indstillinger` indlæser, viser "Konto" → "Skift adgangskode" med tre felter, hver med fungerende vis/skjul-toggle.
- Submit med matchende ny + bekræftelse → toast "Adgangskode opdateret" og felterne ryddes.
- Submit hvor ny ≠ bekræftelse → inline fejl "Adgangskoderne stemmer ikke overens" under bekræftelsesfeltet, ingen toast.
- Tom-felt-validering forhindrer submit med danske fejlbeskeder.
- TopNav "Indstillinger" navigerer til `/indstillinger` og markeres aktiv.
- Tastaturnavigation: tab-rækkefølge felt → toggle → næste felt → … → Gem-knap; tydeligt fokus-ring.
