## Offline-tolerance for timer'en

Mål: stopuret kan startes og stoppes uden netforbindelse. Når brugeren trykker "Gem" i dialogen og kaldet til serveren fejler (eller browseren er offline), bliver målingen lagt i en lokal kø og synkroniseret automatisk når forbindelsen er tilbage.

Resten af appen (historik, redigering, sletning, arkiv) ligger udenfor scope — den kræver fortsat netforbindelse.

### Adfærd

1. **Online (uændret)**: gem → server-kald → toast "Registrering gemt".
2. **Offline eller server-kald fejler**: målingen gemmes i en kø i `localStorage`, og brugeren får en toast: *"Gemt offline — synkroniseres når du er online igen (N i kø)"*.
3. **Optimistisk visning**: køens målinger vises i "i dag"-listen med et lille "venter"-badge (gråt ur-ikon eller "⏳ synker"), så brugeren kan se at de findes.
4. **Auto-sync**: så snart `navigator.onLine` bliver `true` (eller næste vellykkede server-kald), tømmes køen én ad gangen. Ved succes fjernes posten fra køen og listen invalideres. Ved fejl: prøv igen senere (med backoff).
5. **Manuel sync-knap**: lille "Synk nu (N)" i top-nav når køen ikke er tom, så brugeren kan tvinge et forsøg.
6. **Statusindikator i TopNav**: lille prik — grøn (online, tom kø), gul (offline eller venter), rød (sync fejlede gentagne gange).

### Hvad sker der IKKE

- Ingen offline-redigering eller -sletning af eksisterende målinger.
- Ingen service worker (manifest-only PWA forbliver).
- Ingen offline historik-visning — listen forbliver tom uden net (men køen vises optimistisk).
- Ingen konfliktshåndtering — alle nye målinger får friske IDs serverside ved sync.

### Teknisk

**Ny fil**: `src/lib/offline-queue.ts`
- `enqueue(draft)`, `dequeue(id)`, `list()`, `subscribe(cb)` — wrapper om `localStorage` med `precisely.offline-queue` nøgle.
- Hver post: `{ tempId, draft, queuedAt, attempts, lastError? }`.
- Eksporterer React-hook `useOfflineQueue()` der returnerer `{ queue, syncNow, isSyncing }`.

**Ændret**: `src/hooks/use-measurements.ts`
- `add()` i Supabase-grenen forsøger server-kald først; ved netværksfejl eller `!navigator.onLine` → `enqueue()` i stedet.
- Listen `measurements` flettes med køens optimistiske poster (med `tempId` i stedet for rigtig `id` og `pending: true`-flag i `Measurement`-typen).
- Bag-til-bag retry: lytter på `window.addEventListener("online", ...)` + fokus-event, og kører `syncNow()`.

**Ændret**: `src/hooks/use-measurements.ts` `Measurement`-type
- Tilføj `pending?: boolean` så UI kan vise badge.

**Ændret**: `src/components/measurements/MeasurementsList.tsx` (eller den række-komponent der bruges)
- Vis et lille "⏳" eller spinner-badge for `pending`-rækker. Deaktiver redigerings-handlers for dem (de eksisterer jo ikke i DB endnu).

**Ny komponent**: `src/components/stopwatch/SyncStatus.tsx`
- Lille prik + tæller, vises i `TopNav` når der er noget i kø.

**Robusthed**
- Køen er kapacitets-begrænset (fx 200 poster) for at undgå løbsk localStorage.
- Backoff ved gentagne fejl: 5s, 15s, 60s, derefter manuel.
- Hvis server svarer med valideringsfejl (4xx, ikke netværk), fjernes posten fra køen og brugeren får en toast med fejlen — vi prøver ikke evigt med dårlig data.

## Filer

- **Ny**: `src/lib/offline-queue.ts`, `src/components/stopwatch/SyncStatus.tsx`
- **Rediger**: `src/hooks/use-measurements.ts`, `src/components/measurements/MeasurementsList.tsx`, `src/components/stopwatch/TopNav.tsx`, `src/routes/_authenticated/index.tsx` (for at vise pending i dag-listen)
