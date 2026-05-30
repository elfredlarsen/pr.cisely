## Plan

`Gem registrering`-dialogen (FinishPanel) er i dag positioneret under stopur-sektionen (`top-full`), så den lander under stopurets knapper. Brugeren vil have den vist henover knapperne i stedet.

### Ændring
Fil: `src/routes/index.tsx`

- I wrapper-div'en omkring `<FinishPanel>` ændres positioneringen fra `top-full` (under sektionen) til `bottom-12` (oven på knappernes område, matchende stopurets `py-12`-padding).
- Fjern `-mt-2` på det indre div og brug i stedet et lille mellemrum opad fra knapperne (intet ekstra margin nødvendigt — `bottom-12` placerer panelet lige over knapperne).
- Behold `pointer-events-none` på wrapperen og `pointer-events-auto` på det indre div, så klik kun fanges af selve panelet.
- Behold `z-20` så panelet ligger over knapperne.

### Verificering
- Tryk Afslut på `/`: panelet skal nu vises hen over (oven på) Start/Pause/Afslut-knapperne — ikke under dem.
- Bekræft at Annuller/Gem stadig virker og at klik uden for panelet ikke aktiverer de underliggende (dæmpede) knapper.
