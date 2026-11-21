# Bedre kontrast på lille grå tekst

## Problem
Nogle små grå tekster er gjort 30 % gennemsigtige. Det trækker kontrasten under kravet på 4,5:1. Med den fulde grå farve er kontrasten:
- lyst tema: #666666 på #fafafa ≈ 5,5:1 og på #ffffff ≈ 5,7:1
- mørkt tema: #a1a1aa på #0f0f12 ≈ 7,8:1 og på #18181c ≈ 7,0:1

## Ændringer (kun gennemsigtigheden fjernes)
1. `src/components/stopwatch/TimeDisplay.tsx` linje 22: teksterne "Timer / Minutter / Sekunder" under cifrene får den fulde grå farve.
2. `src/components/measurements/MeasurementsList.tsx`:
   - linje 337: sortérbare kolonneoverskrifter, der ikke er valgt
   - linje 360, 363, 366, 369 og 374: kolonneoverskrifterne Start, Slut, Varighed, Kategori og Handlinger
3. `src/components/ui/icon-tooltip.tsx` linje 35: genvejstasten i værktøjstips (fx "N" eller "Mellemrum"), som er endnu mindre tekst (10 px).

Skriftstørrelse, store bogstaver, afstand og placering ændres ikke. Temaets farver ændres heller ikke.

## Ikke ændret
To steder bruges den samme gennemsigtighed, men på pynteikoner, ikke tekst. De ændres derfor ikke:
- `oversigt.tsx:247` (kalenderikonet)
- `MeasurementsTable.tsx:83` (urikonet)

## Kontrol
I testbrowseren måles den faktiske tekstfarve mod baggrunden på stopur, historik og værktøjstip i både lyst og mørkt tema. Alle skal være mindst 4,5:1.
