# Mobil og tablet

Appen er testet i telefon-størrelse (390 px) og tablet-størrelse (820 px). Intet stikker ud over skærmkanten, og tablet ser fint ud. På mobil er der fire problemer.

## Det, der rettes

1. **Stopur-knapperne på mobil:** I dag er de tre knapper smalle og står trykket sammen i midten. På Start mangler ikonet, så der kun står en prik. Rettelse: Knapperne bruger hele bredden, og ikonerne vises igen. På meget smalle skærme vises kun ikonet, med teksten skjult for øjet men stadig læst op af skærmlæsere. Uret skrives lidt større, så det fylder bredden.
2. **Historik på forsiden:** På mobil er kolonnerne Kategori og Slet skåret af til højre. Rettelse: På telefon vises hver registrering som en kort række i to linjer, med tider og varighed øverst og kategori og slet-knap nederst. Tablet og computer beholder tabellen.
3. **Oversigt på mobil:** Der er et stort tomt felt mellem datoen og "Samlet tid", og "Slet" står klemt op ad "Tilføj registrering". Rettelse: Det tomme felt fjernes. "Tilføj registrering" bruger hele bredden, og "Slet dag" kommer på sin egen linje nedenunder.
4. **Dialoger på mobil:** Gem/Tilføj-dialogen får lidt luft til skærmkanten og bliver kun så høj som skærmen, så man kan rulle i den, hvis tastaturet dækker.

## Det, der ikke ændres

Menulinjen, Indstillinger og tablet-visningen fungerer allerede og bliver ikke ændret. Hvis Gem-knappen kunne dækkes af tastaturet, bliver det kontrolleret i punkt 4.

## Afprøvning

Hver side åbnes i test-browseren i 360, 390 og 820 px bredde. Der tages billeder af den tomme dag, en dag med registreringer og en åben dialog.

## Teknisk

- `Stopwatch.tsx`: rækken `grid grid-cols-3 gap-2 w-full`, knapper `min-w-0`, ikon `shrink-0`, tekst `max-[360px]:sr-only`. `TimeDisplay.tsx` får responsiv skriftstørrelse (`text-[clamp(...)]`).
- `MeasurementsTable.tsx` / `MeasurementsList.tsx`: kort-layout under `sm`, tabel fra `sm:`.
- `oversigt.tsx` / `DateNavigator.tsx`: fjern fast `min-h` under 640 px. Handlingsrækken bliver `flex-col sm:flex-row`.
- `ui/dialog.tsx`: `w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto`.
- Brug `dvh` i stedet for `vh`, hvor det er relevant, og behold målstørrelser på mindst 44 px.
