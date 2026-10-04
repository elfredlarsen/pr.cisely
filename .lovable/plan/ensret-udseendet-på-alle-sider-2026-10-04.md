# Ensret udseendet på alle sider

## Hvad ændres

1. **Samme sideopbygning:** Oversigt og Indstillinger får samme bredde, samme luft i siderne og samme overskrift øverst (titel og en kort undertekst). Oversigt får en synlig overskrift "Oversigt".
2. **Privatlivssiden:** Får samme menulinje som de andre sider, når man er logget ind, og samme bredde og overskrift. Er man ikke logget ind, vises kun logoet øverst med et link tilbage.
3. **Fejlsider** ("Siden findes ikke" og "Noget gik galt") bruger appens farver, skrift og knapper og følger lyst og mørkt tema.
4. **Prøvebanneret** øverst (kun synligt i preview) bliver læsbart i lyst tema. I dag er teksten lys gul og svær at læse på lys baggrund.
5. **Browserens farve i toppen** (på telefon/installeret app) følger temaet: lys i lyst tema, mørk i mørkt.

## Teknisk

- Ny fælles komponent `PageHeader` (titel + undertekst) og fælles beholder `max-w-[720px] px-4 sm:px-6 py-8`, brugt i `oversigt.tsx`, `indstillinger.tsx` og `privatliv.tsx`.
- `privatliv.tsx`: viser `TopNav` ved session, ellers simpel logo-header.
- `__root.tsx`: notFound/error-komponenter bruger tokens og `Button`; `theme-color` sættes som to meta-tags med `media="(prefers-color-scheme: light|dark)"`, og `src/lib/theme.ts` opdaterer tagget ved manuelt temavalg.
- `src/lib/error-page.ts` (fallback-HTML uden React): tilføj `@media (prefers-color-scheme: dark)` med appens mørke farver.
- `PreviewBanner.tsx`: hårde amber-farver erstattes af `warning`-tokens (`bg-warning/15 border-warning text-foreground`).
- Kontrollér alle sider i testbrowser i lyst og mørkt tema.
