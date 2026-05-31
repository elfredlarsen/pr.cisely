## Mål

Kun personer med et hemmeligt link kan oprette en konto. Ingen administration, ingen godkendelse — du deler bare ét link med dem du vil give adgang.

## Sådan fungerer det

- Du får ét hemmeligt link, fx:
  `https://din-app.lovable.app/login?key=xK9mP2vL8nQ4`
- Alle med linket kan oprette sig frit.
- `/login` uden eller med forkert kode → kun **log ind**-formularen vises. "Opret konto"-knappen er skjult.
- Eksisterende brugere kan stadig logge ind på `/login` uden koden.
- Hvis koden lækker, ændrer du den ét sted, og det gamle link holder op med at virke.

## Hvad der ændres

**Ny hemmelighed (secret)**
- `SIGNUP_ACCESS_KEY` — den hemmelige streng. Du vælger selv værdien (fx 12+ tilfældige tegn). Kan ændres når som helst.

**Ny server-funktion** `src/lib/signup.functions.ts`
- `checkSignupKey(key)` → returnerer `{ valid: true/false }`. Sammenligner serverside med `SIGNUP_ACCESS_KEY` så koden aldrig ligger i klient-bundlen.

**`/login`-siden**
- Læser `?key=` fra URL'en ved load
- Kalder `checkSignupKey` én gang
- Hvis ugyldig: skjul "Ingen konto? Opret en" + bloker signup-tilstand (hvis nogen prøver at skifte manuelt)
- Hvis gyldig: signup virker som i dag

**Ekstra serverside-tjek**
- En ny server-funktion `signUpWithKey(email, password, key)` der validerer koden igen på serveren og først derefter kalder Supabase. Det forhindrer at nogen kan omgå frontend-tjekket via browser-konsollen.

## Praktisk

- Når planen er godkendt, beder jeg dig vælge værdien til `SIGNUP_ACCESS_KEY` via en secret-prompt.
- Du får dit signup-link med det samme — du kan bruge det selv eller dele det.
- Vil du senere skifte kode: opdater bare secret'en, så er det gamle link dødt.

## Begrænsninger ved denne tilgang

- Alle med linket har adgang — hvis én person deler det videre, kan du ikke spore hvem.
- Hvis du senere vil have engangslinks eller per-bruger invitationer, kan vi bygge det ovenpå.
