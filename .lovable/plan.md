## Problem

`/admin` flakker/blinker. Årsag i `src/routes/_authenticated/admin.tsx`:

```ts
if (status === "loading" || role.isLoading || role.isFetching) {
  return null;
}
```

`role.isFetching` bliver `true` ved enhver baggrunds-refetch (f.eks. window-focus, `staleTime` udløb efter 60 s, query-invalidation efter mutation på kategorier). Hele siden returnerer da `null` og forsvinder kortvarigt → synligt blink, især når man interagerer med kategori-listen (create/update/delete invaliderer `["categories"]`, men focus/refetch på `["my-role-info"]` rammer samtidig).

Sekundært: `status === "loading"` håndteres allerede af `_authenticated`-layoutet, så det check er redundant her.

## Løsning

I `AdminPage` (kun gatingen — ingen ændring af `AdminContent`, kategori-CRUD eller styling):

- Fjern `role.isFetching` fra gate-betingelsen — vi skal kun blanke ud ved initial load, ikke ved baggrunds-refetch.
- Behold `role.isLoading` (initial hentning, ingen cached data endnu).
- Fjern det redundante `status === "loading"` check (layoutet viser allerede "Indlæser…").
- Når `role.data` findes fra cache, render `AdminContent` med det samme; baggrunds-refetch sker stille uden at unmounte siden.

Resultat: ingen unmount/remount af admin-UI'et ved refetch → intet blink.

## Teknisk

Fil: `src/routes/_authenticated/admin.tsx`

Ny gate (kun denne blok ændres):

```ts
if (role.isLoading) return null;
if (!role.data?.isAdmin) return <Navigate to="/" replace />;
return <AdminContent />;
```

Ingen øvrige ændringer. Ingen migrations. Ingen rolle-/sikkerhedsændringer (`has_role`-guarden står ved magt).

## Verifikation

Browser-test på `/admin`: omdøb en kategori, slet en kategori, fokusér væk og tilbage på vinduet — siden må ikke blanke ud undervejs.