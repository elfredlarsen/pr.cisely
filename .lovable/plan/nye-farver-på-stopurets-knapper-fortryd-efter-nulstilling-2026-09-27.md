# Nye farver på stopurets knapper + Fortryd efter nulstilling

## Hvad ændres

1. **Farver (hvid tekst og ikon på alle):**
  - Start og Fortsæt: grøn `#15803d` (kontrast 5,0:1)
  - Pause: rav/varm gul `#b45309` (5,0:1). En lys gul kan ikke have hvid tekst og samtidig være læselig, så en dyb rav bruges.
  - Afslut: appens lilla `#9333ea` (5,4:1)
  - Nulstil: grå `#52525b` (7,7:1)
2. **Fortsæt-ikonet** skifter fra "spol frem" til samme Play-ikon som Start.
3. **Escape nulstiller ikke længere.** N gælder stadig som genvej til Nulstil.
4. **Fortryd:** Efter nulstilling vises en besked "Stopuret er nulstillet" med knappen "Fortryd" i 5 sekunder. Et klik på Fortryd henter den tid og tilstand tilbage, som stopuret havde lige før (kørende tæller videre, som om det aldrig blev nulstillet; pause vender tilbage som pause).  
  
Hvis stopuret startes igen, mens Fortryd-beskeden vises, skal beskeden forsvinde, så en ny tidtagning ikke kan overskrives.

## Teknisk

- `src/styles.css`: nye tokens `--timer-start`, `--timer-pause`, `--timer-finish`, `--timer-reset` (+ `-foreground`), registreret i `@theme inline`; knapperne i `Stopwatch.tsx` bruger dem i stedet for faste hex-klasser.
- `StopwatchContext.tsx`: `reset()` returnerer et øjebliksbillede af den tidligere tilstand (status, startet/akkumuleret tid); ny `restore(snapshot)` skriver det tilbage, inkl. den gemte tilstand i browseren.
- `Stopwatch.tsx`: fjern `Escape`-casen; `FastForward` erstattes af `Play`; ved klik/genvej på Nulstil vises `toast("Stopuret er nulstillet", { action: { label: "Fortryd", onClick: () => restore(snap) }, duration: 5000 })`.
- Nulstillingen efter "Gem registrering" (i `index.tsx`) viser ingen Fortryd-besked.
- `DESIGN.md`: tilføj stopurets knapfarver.