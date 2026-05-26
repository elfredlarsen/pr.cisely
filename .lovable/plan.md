## Undgå tekstombrydning på "Ryd historik"

### Problem
Når en lang kategori som "Biometri inkl. indgivelse af ansøgning" vælges i rækkerne, udvider kategori-kolonnen sig og presser den sidste kolonne sammen, så "Ryd historik"-knappens tekst brydes over to linjer.

### Løsning i `src/components/stopwatch/MeasurementsTable.tsx`
Tilføj `whitespace-nowrap` på knappen der indeholder "Ryd historik", så teksten aldrig kan brydes — uanset hvor smal kolonnen bliver.