## Tooltips med genveje skal vises over knappen

### Ændring
I `src/components/stopwatch/Stopwatch.tsx` linje 87: ændr `side="bottom"` til `side="top"` på `<TooltipContent>`, så tooltips med tastatur-genveje vises over stopur-knapperne i stedet for under.

### Ingen andre ændringer
Øvrige tooltips uden genveje påvirkes ikke.