## 1. TimeDisplay: labels centreret under cifre i samme stil som tabelhoveder

I `src/components/stopwatch/TimeDisplay.tsx` opdeles tiden i tre kolonner (Timer, Minutter, Sekunder) med koloner imellem, så hver label kan placeres præcist under sit ciffer-par:

```
   00      :      00      :      00
 TIMER          MINUTTER       SEKUNDER
```

- Hver gruppe wrapper cifre + label i en `flex flex-col items-center`.
- Kolonerne (`:`) ligger som separate spans uden label under sig, så de ikke skubber til centreringen.
- Labels får samme diskrete stil som tabelhovederne: `text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70`.
- `sr-only`-tekst bevares for skærmlæsere.

## 2. Ensartet font for alle tidsvisninger

Alle tidsvisninger skifter fra `font-mono` (JetBrains Mono) til Poppins med `tabular-nums`, så tallene matcher og står på linje.

- **`TimeDisplay.tsx`** — bruger allerede Poppins; bekræft `font-variant-numeric: tabular-nums` på alle tal-spans.
- **`MeasurementsTable.tsx`** — fjern `font-mono` på:
  - Start/Slut-input (linje 216)
  - Start/Slut-knap (linje 224)
  - Varighed-input (linje 244)
  - Varighed-knap (linje 252)
  
  Erstat med `tabular-nums` (Poppins arves fra body). Tabel-headerne "Start", "Slut", "Varighed", "Kategori" rører vi ikke.

- **`FinishPanel.tsx`** — fjern `font-mono` på de tre tidsfelter (linje 206, 219, 233), behold `tabular-nums`.

## Bevares uændret
- Layout, bredder, opaciteter og farver i tabellen.
- Logik for redigering, parsing og masking.
- Stopurets størrelse og knapper.
