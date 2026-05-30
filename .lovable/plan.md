## Ændring

I `src/routes/_authenticated/admin.tsx`:

- Fjern den indre `max-w-md`-wrapper omkring `<CategoriesAdminList />` + `<AddCategoryForm />` så listen og tilføj-feltet fylder hele kortets bredde.
- Gør selve kortet bredere på desktop: erstat `lg:col-start-2 lg:max-w-none` + 3-kolonne-griddet med en simplere centreret container, fx `max-w-2xl mx-auto` (ca. 42rem), så boksen er markant bredere end indstillingers `max-w-md` (28rem) men stadig komfortabel at læse.
- Mobil-bredden (`max-w-md` på små skærme) bevares uændret.

Ingen ændringer i `CategoriesSection` i indstillinger og ingen funktionelle ændringer.
