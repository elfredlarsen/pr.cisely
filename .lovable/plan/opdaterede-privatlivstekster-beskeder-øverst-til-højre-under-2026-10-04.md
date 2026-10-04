# Opdaterede privatlivstekster + beskeder øverst til højre under menuen

## 1. Privatlivssiden (personligt værktøj)
Teksterne på "Privatliv og vilkår" skrives om, så det står klart, at pr:cisely er et personligt værktøj:
- **Ny indledning:** pr:cisely er et personligt værktøj til egen tidsregistrering. Det bruges ikke af arbejdsgivere til at registrere ansattes arbejdstid, og dine data deles ikke med nogen.
- **Hvilke data:** samme liste, plus at der ikke gemmes IP-adresser, placering eller fritekstnoter.
- **Retsgrundlag (nyt):** data behandles for at levere den tjeneste, du selv har bedt om (aftale, GDPR art. 6, stk. 1, litra b).
- **Hvor data ligger:** tilføj at data ligger hos en databaseudbyder inden for EU/EØS eller med tilsvarende beskyttelse, og at der ikke bruges cookies til sporing — kun det nødvendige til at holde dig logget ind.
- **Dine rettigheder:** gør dem konkrete: indsigt/kopi (skriv til kontaktmailen), sletning af historik selv under Indstillinger, sletning af konto via kontaktmail, svar inden for 30 dage, klage til Datatilsynet.
- **Brugervilkår:** tilføj "kun til personlig brug".
- Dato opdateres til 4. oktober 2026.

## 2. Beskeder øverst til højre, under menulinjen
- Små beskeder (fx "Fortryd", "Kopieret", "Kategori ændret") vises igen øverst til højre, men lige under menulinjen, så de aldrig dækker menuens knapper.
- Samme placering på telefon.

## Tekniske detaljer
- `src/routes/privatliv.tsx`: kun tekstændringer i eksisterende `Section`-blokke + ny indledning og ny sektion "Retsgrundlag"; nummerering justeres.
- `src/components/ui/sonner.tsx`: `position="top-right"` og `offset` ≈ 72px (menuen er 64px høj, `h-16`), samt `mobileOffset` med samme top.
- Verificeres i browseren: tryk Nulstil og bekræft at beskeden ligger under menuen.
