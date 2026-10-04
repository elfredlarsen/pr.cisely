# Trin 3: Nulstil uden bekræftelse

## Hvad ændres

- Når du trykker **Nulstil** (eller tasten **N**), nulstilles stopuret med det samme. Spørgsmålet "Nulstil stopur?" forsvinder.
- Beskeden "Stopuret er nulstillet" med **Fortryd** vises som nu i 5 sekunder og bliver stående, mens musen er over den, eller den har tastaturfokus.
- Fortryd giver den tidligere tid tilbage som nu: kørte uret, tæller det videre, som om det aldrig var nulstillet. Stod det på pause, kommer det tilbage på pause.
- Starter du uret igen, mens beskeden vises, forsvinder den (uændret).
- Esc nulstiller stadig ikke.

## Teknisk

- `Stopwatch.tsx`: `onReset` udfører nulstilling og viser Fortryd-beskeden direkte (det nuværende `confirmReset`). Fjern `resetOpen`-tilstanden, `AlertDialog`-blokken og dens imports samt den særlige N-håndtering, mens dialogen er åben.
- `DESIGN.md`: notér at nulstilling ikke bekræftes, men kan fortrydes i 5 sekunder (undtagelse fra reglen om bekræftelse, da det ikke er en sletning af gemte data).
- Afprøv i testbrowser: N under kørsel nulstiller straks, og Fortryd giver tiden tilbage.
