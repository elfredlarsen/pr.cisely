## Forgrund ved hover og redigering

### Fil
`src/components/stopwatch/MeasurementsTable.tsx`

I dag har `<section>` `opacity-75` konstant. Vi tilføjer:

- Lokal state `hasFocus: boolean` (true når en celle redigeres).
- `onMouseEnter` / `onMouseLeave` på `<section>` sætter en `hovered`-state.
- `opacity-75` erstattes med en betinget klasse:
  - `opacity-100` når `hovered || editing !== null`
  - ellers `opacity-75`
- Tilføj `transition-opacity duration-200` så skiftet er blødt.
- `editing`-state findes allerede — bruges direkte; ingen ekstra state nødvendig.

Ingen ændring i tooltip-adfærd, layout eller indhold.

---

## Strukturlåste tidsfelter (HH:MM:SS)

### Mål
Brugeren kan kun ændre tallene i Start, Slut og Varighed — aldrig kolonner, separatorer eller længde. Genberegning sker som hidtil:
- Ændret **Start** → Varighed = Slut − Start (Slut uændret).
- Ændret **Slut** → Varighed = Slut − Start (Start uændret).
- Ændret **Varighed** → Slut = Start + Varighed (Start uændret).

Den eksisterende `commit()`-logik dækker allerede dette korrekt, så kun input-UX'en ændres.

### Implementering — Start og Slut
Brug native `<input type="time" step="1">`:
- Browseren håndhæver HH:MM:SS-formatet og spinner kun cifrene.
- `value` formateres som `HH:MM:SS` (samme som `fmtTime`).
- `onChange` opdaterer `draft` med strengen browseren leverer.
- `onBlur` / Enter kører den eksisterende `commit()` — `parseTime` accepterer allerede `HH:MM:SS`.
- Escape annullerer som i dag.

### Implementering — Varighed
`<input type="time">` kan ikke vise > 23 timer pålideligt, og Varighed er ikke et klokkeslæt. I stedet bruges et maskeret tekstfelt:

- Ny komponent `DurationInput` (lokal i filen) med fast bredde for 3 par cifre.
- Renderer tre `<input inputMode="numeric" maxLength={2}>` for HH, MM, SS med faste `:`-separatorer som tekst imellem.
- Hvert felt:
  - tillader kun cifre (`onBeforeInput` afviser ikke-cifre)
  - clamper MM/SS til 0–59 ved blur
  - HH tillader 0–999
  - auto-tab til næste felt når 2 cifre er indtastet
  - Backspace på tomt felt går til forrige felt
- Ved blur/Enter samles værdien til `HH:MM:SS` og sendes gennem den eksisterende `parseDuration` → `commit()`.

Resultat: separatorer og struktur kan aldrig slettes eller flyttes; kun cifrene er redigerbare.

### Tilgængelighed
- Hvert input får `aria-label` ("Starttidspunkt", "Sluttidspunkt", "Varighed timer/minutter/sekunder").
- Fokus-ring bevares (`focus-visible:ring-2 focus-visible:ring-ring`).
- Min. 44px klikmål bevares via samme button-størrelse i visningstilstand.

### Ingen ændringer
- Tooltip-adfærd på header-rækken.
- Kategori-vælger, skjul-knap, ryd-historik.
- Datamodel og `onUpdate`-kontrakt.
- `parseTime` / `parseDuration` / `commit()` — eksisterende logik genbruges 1:1.
