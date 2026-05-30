Reducer mellemrummet mellem stopur-knapperne og hold stopur, knapper og tabel centreret horisontalt (mx-auto).

I `src/components/stopwatch/Stopwatch.tsx`:

- Linje 202 (wrapper-div): skift `max-w-3xl ... px-4` tilbage til en smallere centreret container: `mx-auto flex w-full max-w-2xl flex-col items-stretch gap-6 px-4`. Den centreres så den ligger pænt over tabellens `max-w-3xl`.
- Linje 211 (knapraden): erstat den betingede `${... "justify-center" : "justify-between"}` med fast `justify-center` og brug `gap-3` (i stedet for `gap-6`), så knapperne sidder tæt samlet uanset antal.

Ingen ændringer i knapstørrelser eller funktionalitet.
