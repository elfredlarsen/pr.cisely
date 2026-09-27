# Nye farver på stopurets knapper + Fortryd efter nulstilling

## Hvad ændres

1. **Farver (hvid tekst og hvidt ikon på alle knapper):**
   - Hovedknappen (Start, Pause, Fortsæt): appens lilla `#9333ea` (kontrast ca. 5,4:1). Samme farve i alle tre tilstande, kun ikon og tekst skifter.
   - Afslut: petrolgrøn `#0f766e` (ca. 5,5:1).
   - Nulstil: blågrå `#64748b` (ca. 4,8:1).
2. **Ikoner:** Start og Fortsæt bruger Play, Pause bruger Pause. Afslut får et flueben i stedet for firkanten.
3. **Escape nulstiller ikke længere.** N er stadig genvej til Nulstil.
4. **Fortryd:** Efter nulstilling vises "Stopuret er nulstillet" med knappen "Fortryd" i 5 sekunder. Fortryd henter præcis den tidligere tilstand tilbage (kørende tæller videre, som om den aldrig blev nulstillet; pause vender tilbage som pause).
5. **Starter man stopuret igen**, mens beskeden vises, forsvinder den, så en ny tidtagning ikke kan overskrives.
6. **Beskeden bliver stående**, mens musen er over den, eller den har tastaturfokus. De 5 sekunder starter forfra, når musen/fokus forlader den.
7. **Ingen Fortryd-besked** efter "Gem registrering".

## Teknisk

- `src/styles.css`: tokens `--timer-primary` (#9333ea), `--timer-finish` (#0f766e), `--timer-reset` (#64748b), `--timer-foreground` (#ffffff); registreres i `@theme inline`. Gamle `--timer-start`/`--timer-pause` fjernes.
- `Stopwatch.tsx`: Start/Pause/Fortsæt bruger `bg-timer-primary`; `Square` erstattes af `Check`; ingen `Escape`-case; Fortryd-toast med fast id, `toast.dismiss(id)` ved Start.
- Hover pauser allerede nedtællingen i beskedkomponenten. For tastaturfokus: toasten får `duration: Infinity`, og en lille timer i `Stopwatch.tsx` lukker den efter 5 s, pauset ved `pointerenter`/`focusin` og genstartet ved `pointerleave`/`focusout` (lyttere på toastens element via dens id).
- `StopwatchContext.tsx`: `reset()` returnerer øjebliksbillede; `restore(snapshot)` virker kun på et nulstillet stopur.
- `index.tsx`: nulstillingen efter gem kalder `reset()` uden toast (uændret).
- `DESIGN.md`: opdatér stopurets knapfarver.
