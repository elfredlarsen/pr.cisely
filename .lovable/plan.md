# Indstillinger: ny rækkefølge og tilføj kategori

## Hvad ændres

1. **Ny rækkefølge** i Indstillinger: Kategorier, Inviter en kollega, Skift adgangskode, Udseende og Mine data.
2. **Tilføj kategori:** Nederst i Kategorier-kortet kommer et felt "Ny kategori" med knappen "Tilføj". Det er nok at trykke Enter.
   - Den nye kategori lægges nederst på listen og er slået til med det samme, så den kan vælges, når du gemmer en registrering.
   - Hvis navnet er tomt, får du en besked. Det samme gælder, hvis navnet allerede findes, hvis du ikke tager eller lægger mellemrum med i sammenligningen og ikke skelner mellem store og små bogstaver. Navnet må højst være 80 tegn.
   - Når kategorien er tilføjet, vises en kort bekræftelse ("Kategori tilføjet"). Feltet tømmes, så du kan tilføje den næste.
   - Kategorien tilhører kun dig, ligesom dine andre kategorier.

## Teknisk

- `indstillinger.tsx`: Sektionerne flyttes rundt.
- `categories.functions.ts`: Ny `createCategory` (`requireSupabaseAuth`, zod med label trimmet 1–80 tegn). Den laver en unik `value`-slug ud fra navnet (æ/ø/å omskrives), sætter `sort_order` til max+1 og `hidden=false`, og tjekker for et label, der allerede findes, uden at skelne mellem store og små bogstaver. RLS og den eksisterende `UNIQUE(user_id, value)` gælder. Der er ingen ændringer i skemaet, så ER-diagrammet er uændret.
- Ny `AddCategoryForm` i `CategoriesSection.tsx`. Den bruger Input og Button, invaliderer kategori-forespørgslen med `useInvalidateCategories` og viser en toast ved succes eller fejl.
- Afprøves i test-browseren: tilføj en kategori, se at den dukker op i Gem-vinduet, og prøv med et navn, der allerede findes.
