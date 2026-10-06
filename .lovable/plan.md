# Beskeder nederst i midten

## Hvad ændres
- Alle beskeder (fx "Stopuret er nulstillet", "Registrering slettet", "Kategori tilføjet") vises nederst i midten af skærmen i stedet for øverst til højre.
- De dækker derfor ikke længere menuens "···"-knap eller stopurets Start/Pause-knap.
- På telefon står beskeden nederst med lidt luft til kanterne og over telefonens hjem-linje.
- Beskeder med "Fortryd" bliver stående i 5 sekunder som nu. Rene bekræftelser uden knap forsvinder efter ca. 3 sekunder.

## Tekniske detaljer
- `src/components/ui/sonner.tsx`: `position="bottom-center"`, `offset={{ bottom: 24 }}`, `mobileOffset={{ bottom: "calc(16px + env(safe-area-inset-bottom))", left: 12, right: 12 }}`, standard `duration: 3000` i toastOptions (Fortryd-beskeder har allerede `duration: 5000`). Bredde 340 px bevares; på mobil fuld bredde minus kant.
- Hukommelsen opdateres: beskeder nederst i midten.
- Verificeres i test-browser ved 390 og 1280 px: tryk Nulstil og slet en registrering, og bekræft at beskeden ikke dækker knapper.
