## Plan

### 1. Foldbar kommentar ved kategori "Andet"
Fil: `src/components/measurements/MeasurementsList.tsx`

- Tilføj lokal state `expandedComments: Set<string>` for hvilke rækker der har kommentaren foldet ud. Standard = tom (alle foldet ind).
- I hovedrækken: når `m.category === "andet"`, vis en lille chevron-knap (ChevronRight, roterer til 90° når åben) ved siden af eller før slet-ikonet. Klik toggler rækken i settet.
- Hvis rækken har en kommentar i forvejen, vis en kort preview/indikator på knappen (fx prik eller MessageSquare-ikon) så brugeren ved der findes indhold.
- Kommentarrækken renderes kun når rækken er i `expandedComments`. Behold eksisterende redigeringslogik uændret.
- Når kategori skiftes væk fra "andet", fjern id'et fra settet.

### 2. Fjern "Ryd historik" fra historikken
Fil: `src/components/stopwatch/MeasurementsTable.tsx`

- Fjern `clearHistoryButton` og dens wrapper-div over tabellen.
- Fjern `onDeleteAll` fra `Props` og fra prop-destrukturering.
- Fjern `toast`-import hvis ikke brugt andre steder i filen.

Fil: `src/routes/index.tsx`

- Fjern `onDeleteAll={removeAllToday}` fra `<MeasurementsTable>`.

### 3. Tilføj "Ryd historik" og "Ryd al historik" til Oversigt
Fil: `src/hooks/use-measurements.ts`

- Tilføj ny funktion `removeAll` der sletter alle målinger (inkl. skjulte). Returnér den fra hook'en.

Fil: `src/routes/arkiv.tsx`

- Hent `removeAllToday` og `removeAll` fra `useMeasurements`.
- Tilføj to knapper i Oversigt — placeret ved siden af `Tilføj registrering`-knappen i bunden (eller som ekstra slot i `DaySummary`'s `leftSlot`, ved siden af "Fold alle"). Anbefalet placering: i `leftSlot` ved siden af fold-alle-knappen for at matche eksisterende UI-mønster.
  - **Ryd historik** (dagens registreringer): aktiv kun når `dayMeasurements.length > 0`. Bekræftelsesdialog → `removeAllToday()` + toast "Dagens historik slettet".
  - **Ryd al historik** (alle dage): aktiv kun når `measurements.length > 0`. Bekræftelsesdialog med tydeligere advarsel → `removeAll()` + toast "Al historik slettet".
- Begge knapper bruger `AlertDialog` med samme stilart som de eksisterende slet-dialoger (destructive action).

### 4. Verificering
- Tjek `/`: historikken har ikke længere "Ryd historik"-knappen.
- Tjek `/arkiv`: begge nye knapper virker, dialoger bekræfter, toasts vises.
- Tjek at kommentarrækken for "andet" er foldet ind som standard og kan foldes ud/ind via chevron.
