## Mål

Centrer indholdet på `/indstillinger` så Konto-kortet og "Skift adgangskode"-formularen sidder midt på siden i stedet for venstrejusteret.

## Ændringer i `src/routes/indstillinger.tsx`

- `<h1>Indstillinger</h1>`: tilføj `text-center`.
- Konto-sektionens `<header>`: tilføj `text-center` så overskrift og beskrivelse centreres.
- "Skift adgangskode"-underafsnit: centrer overskriften (`text-center`) og centrer form-wrapperen ved at ændre `max-w-md` til `mx-auto max-w-md`.
- Selve `<section>`-kortet beholder sin nuværende bredde (`max-w-3xl` på `<main>`), men hovedindholdet inde i kortet centreres.

Ingen ændringer i `ChangePasswordForm` — labels/felter forbliver venstrejusteret inde i formularen (standard for inputs), men hele formularblokken centreres på siden.

## Verifikation

- `/indstillinger`: H1, sektionsoverskrift, beskrivelse og formularblok er vandret centreret. Input-labels står stadig venstre over deres felter.
