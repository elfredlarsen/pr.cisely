## Hvorfor det sker

Begge sider (`/` og `/arkiv`) har et `max-w-3xl` (= 768px) på indholdscontaineren. På den smalle preview-viewport (927px) fylder tabellen næsten hele bredden, men i et bredt browservindue (fx 1400-1900px) bliver tabellen "låst fast" på 768px og virker derfor smal i forhold til den ledige plads.

Det er ikke en bug — det er bare den faste max-bredde der ikke skalerer.

## Løsning

Øg max-bredden så tabellen får mere plads i brede vinduer, og behold paritet mellem `/` og `/arkiv` (jf. memory).

- `src/components/stopwatch/MeasurementsTable.tsx`: skift `max-w-3xl` → `max-w-5xl` på den indre wrapper.
- `src/routes/arkiv.tsx`: skift `max-w-3xl` → `max-w-5xl` på `<main>` så oversigten matcher.

`max-w-5xl` = 1024px. Det giver markant mere bredde i en almindelig browser uden at blive uoverskueligt på 1080p-skærme. På smalle viewports bliver layoutet uændret (responsivt indtil 1024px).

## Verifikation

- Åbn `/` i et bredt browservindue: tabellen er tydeligt bredere og bruger mere af pladsen.
- Åbn `/arkiv`: samme bredde som forsiden.
- På smalle viewports (~900px): uændret — beggesider fylder hele bredden minus padding.

## Memory-opdatering

Memory-reglen "historik skal matche oversigt 1:1" forbliver gyldig fordi vi ændrer begge sider samtidig.