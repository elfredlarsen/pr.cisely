# Fjern kolonnerne `hidden` og `category` fra registreringer

## Kontrol (udført)
- Appens kode læser og skriver kun `category_id`. Hvor der står "category" i koden, er det kategoriens navn/værdi, som slås op via `category_id` — ikke den gamle kolonne.
- Intet bruger `hidden` på registreringer (kun `categories.hidden`, som bliver).
- I databasen afhænger ingen funktioner, visninger eller nattejob af de to kolonner.

## Sådan fjernes de
Lovables værktøj må ikke slette kolonner automatisk. Derfor skal du selv køre én linje i SQL-editoren (jeg giver dig en knap direkte til den):

```sql
ALTER TABLE public.measurements DROP COLUMN hidden, DROP COLUMN category;
```

## Bagefter
- Jeg henter den nye databasebeskrivelse, så appens kode kender den nye tabel.
- Jeg tjekker, at appen stadig bygger, og at forsiden og oversigten viser registreringerne som før.
- AGENTS.md opdateres, så noten om de udfasede kolonner fjernes.
