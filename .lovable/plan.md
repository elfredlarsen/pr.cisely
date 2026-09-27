# Slet kommentarfeltet helt fra databasen

## Hvad ændres
- Det tomme kommentarfelt fjernes permanent fra registreringerne i databasen.
- Intet ændrer sig i appen: koden bruger ikke længere feltet, og det er allerede tomt.

## Tekniske detaljer
- Migration: `ALTER TABLE public.measurements DROP COLUMN IF EXISTS comment;`
- Kodebasen er gennemsøgt: ingen referencer til `comment` udover den autogenererede typefil, som opdateres automatisk efter migrationen.
- Efter migrationen: tjek at forsiden og oversigten stadig indlæser registreringer uden fejl.
