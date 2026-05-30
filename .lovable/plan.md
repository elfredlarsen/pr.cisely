## Justeringer til `/admin`

**1. Én samlet "Kategorier"-boks** (i stedet for to bokse)
- Fjern den separate "Tilføj kategori"-sektion.
- Grid'et bliver til ét centreret kort (ligesom hver enkelt boks i indstillinger).
- Tilføj-formularen flyttes ind nederst i Kategorier-boksen, adskilt med en tynd border-top og lidt margen.

**2. Listestil matcher `CategoriesSection` i indstillinger 1:1**
- Brug samme container: `scrollbar-purple max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border`.
- Rækker: `flex min-h-11 items-center justify-between gap-4 px-4 py-2` — samme padding og højde som indstillinger.
- Navnet vises som almindelig tekst (`text-sm`) når det ikke redigeres — ikke en altid-synlig `Input`-boks. Dobbeltklik (eller klik på et lille pen-ikon) skifter til redigerings-tilstand med inline `Input`. Enter/blur gemmer, Escape annullerer.
- Slet-knappen til højre er et lille `Trash2` ghost-ikon, samme visuelle vægt som `Switch`'en i indstillinger.
- Behold scroll-fade-overlays top/bund (samme som indstillinger).

**3. Layout af kortet**
```
┌─ Kategorier ──────────────────┐
│  (centreret header + beskr.)  │
│                               │
│  ┌─────────────────────────┐  │
│  │ Kategori 1        [🗑]  │  │  ← samme look som indstillinger
│  │ Kategori 2        [🗑]  │  │
│  │ ...                     │  │
│  └─────────────────────────┘  │
│                               │
│  ─ border-top ─               │
│  [ Navn på ny kategori ] [+]  │  ← tilføj nederst
└───────────────────────────────┘
```

## Ingen ændringer i

- Server-funktionerne (`createCategory`, `updateCategory`, `deleteCategory`).
- Database/RLS.
- Indstillinger-siden.
