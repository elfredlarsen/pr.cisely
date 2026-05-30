Juster stopur-containerens bredde og padding så den matcher historiktabellen (`max-w-3xl` + `px-4`):

I `src/components/stopwatch/Stopwatch.tsx`:
- Linje 196: skift `<section>` className fra `... px-6 py-8 ...` til `... py-8 ...` (fjern `px-6`).
- Linje 202: skift wrapper-div fra `flex w-[36rem] max-w-full flex-col items-stretch gap-8` til `mx-auto flex w-full max-w-3xl flex-col items-stretch gap-8 px-4`.

Resultat: ved `running`/`paused` med `justify-between` ligger venstre knap præcis i tabellens venstre kant og højre knap i højre kant. Tidsdisplay strækker sig samme bredde. Start-knappen ved `idle` forbliver centreret (ingen ændring i knapadfærd).
