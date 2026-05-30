## Plan

### 1. Sortering: historikken skal vise seneste først
Fil: `src/components/measurements/MeasurementsList.tsx`

- Ændr standard-sortering så den respekterer `sortable`-prop'en. Initial state bliver:
  - `sortable === true` (Oversigt): `{ field: "start", dir: "asc" }` — uændret.
  - `sortable === false` (Historik): `{ field: "start", dir: "desc" }` — seneste registrering øverst.

### 2. Header ser for lav ud
Fil: `src/components/measurements/MeasurementsList.tsx`

- I `<TableHeader>` bruges `h-8 py-1` på `<TableHead>`-cellerne, hvilket gør headeren markant lavere (32px) end shadcn-standarden (40px) og lavere end body-rækkerne (slet-knappen er `h-9`). Det får headeren til at virke klemt — især når den er sticky.
- Forhøj header-cellerne til `h-10` og opdater `py-1` til `py-2` så headeren får samme visuelle vægt som body-rækkerne i begge tabeller (Historik + Oversigt).
- Behold `text-[11px]` typografi, sticky/baggrundsklasser og bredder uændret.

### 3. Verificering
- Tjek `/`: nyeste registrering vises øverst, header virker visuelt afbalanceret.
- Tjek `/arkiv`: header har samme højde, sortering virker stadig efter klik på kolonneoverskrifter.
